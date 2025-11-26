# Imports
from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, List
import uuid, json, re, os, hashlib, threading, time, logging
from ai_ml_tools.utils.webScraper.scrape import scrape_website, split_dom_content
from ai_ml_tools.utils.webScraper.parse import parse_with_azure_llm
from langchain_openai import AzureOpenAIEmbeddings
from langchain_chroma import Chroma
from chromadb.config import Settings
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin
from ai_ml_tools.utils.openai import request_openai_chat
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone, timedelta
from openai import RateLimitError

router = APIRouter(prefix="/api", tags=["web-scraper"])

_memory: Dict[str, List[str]] = {}
_combined_text: Dict[str, str] = {}
_session_url: Dict[str, str] = {}
_url_locks: Dict[str, threading.Lock] = {}
_url_locks_guard = threading.Lock()

PERSIST_DIR = "chroma_store"
COLLECTION  = "web_chunks_v6"

os.environ.setdefault("CHROMA_TELEMETRY_ENABLED", "false")
os.environ.setdefault("ANONYMIZED_TELEMETRY", "false")

# Classes
class ScrapeReq(BaseModel):
    url: str
    force: bool = False


# Functions
def _build_embeddings():
    '''Creates and returns an AzureOpenAIEmbeddings client configured from environment variables.'''
    return AzureOpenAIEmbeddings(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
        azure_deployment=os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT"),
    )

# get or create the vector database store
def _get_or_create_vs(emb):
    '''Returns a Chroma vector store (persisted on disk) that uses the provided embedding function.'''
    return Chroma(
        collection_name=COLLECTION,
        persist_directory=PERSIST_DIR,
        embedding_function=emb,
        client_settings=Settings(anonymized_telemetry=False),
    )

def _embed_with_retry(emb, texts: list[str], max_retries: int = 3, base_delay: int = 20):
    """
    Try to embed `texts`, retrying on Azure OpenAI rate limits.
    """
    for attempt in range(max_retries):
        try:
            return emb.embed_documents(texts)
        except RateLimitError as e:
            wait = base_delay * (attempt + 1)
            logging.warning(
                f"[EMBED] Rate limit hit (attempt {attempt+1}/{max_retries}); "
                f"sleeping {wait}s. Error: {e}"
            )
            time.sleep(wait)
        except Exception as e:
            logging.error(f"[EMBED] Unexpected embedding error: {e}")
            raise

    # If we get here, all retries failed because of rate limits
    logging.error("[EMBED] Giving up on this batch after repeated rate limits.")
    return None

# insert chunks into the vector store 
def upsert_chunks_into_vector_db(chunks: list[str], source_url: str, site_meta: dict | None = None) -> int:
    """
    Embeds the given text chunks, attaches metadata, and upserts them into
    the Chroma vector database.

    IMPORTANT:
    - Batches chunks to avoid slamming rate limits.
    - Retries on RateLimitError with exponential-ish backoff.
    - If rate limit persists, stops embedding further batches but DOES NOT crash.
    - Returns the number of chunks that were actually embedded.
    """
    if not chunks:
        return 0
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    site_meta = site_meta or {}

    base = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:12]
    now  = datetime.now(timezone.utc).isoformat()
    ids = [f"{base}-{i}" for i in range(len(chunks))]
    default_favicon = _host_favicon(source_url)
    metas = [{
        "source": source_url,
        "chunk_index": i,
        "doc_id": base,
        "scraped_at": now,
        "site_title": (site_meta.get("site_title") or ""),
        "site_description":(site_meta.get("site_description") or ""),
        "favicon": (site_meta.get("favicon") or default_favicon),
        "duration_seconds": site_meta.get("duration_seconds"),
    } for i in range(len(chunks))]

    # batch + retry logic if rate limit is encountered
    batch_size = 32
    embedded = 0

    for start in range(0, len(chunks), batch_size):
        batch_chunks = chunks[start:start + batch_size]
        batch_ids = ids[start:start + batch_size]
        batch_metas = metas[start:start + batch_size]

        vectors = _embed_with_retry(emb, batch_chunks)

        if vectors is None:
            # Stop embedding more, but don't crash the whole request.
            logging.error(
                f"[EMBED] Stopping further upserts for {source_url} "
                f"after repeated rate limits. Embedded so far: {embedded} chunks."
            )
            break

        # Normal upsert
        vs._collection.upsert(
            ids=batch_ids,
            documents=batch_chunks,
            embeddings=vectors,
            metadatas=batch_metas,
        )
        embedded += len(batch_chunks)

    return embedded


def _load_ordered_vectors(url: str) -> tuple[list[str], list[dict]]:
    """Return (ordered_docs, ordered_metas) for a URL from Chroma."""
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    res = vs._collection.get(
        where={"source": {"$eq": url}},
        include=["documents", "metadatas"],
        limit=10_000,
        offset=0,
    )
    docs  = res.get("documents") or []
    metas = res.get("metadatas") or []
    if not docs:
        raise ValueError("URL not found in vector store. Scrape it first.")

    order = sorted(range(len(docs)), key=lambda i: (metas[i] or {}).get("chunk_index", i))
    return [docs[i] for i in order], [metas[i] for i in order]

def _load_website_blob(url: str, cap: int = 200_000) -> str:
    """Join ordered chunks into a single capped string for prompting."""
    docs, _ = _load_ordered_vectors(url)
    return ("\n\n".join(docs))[:cap]

def _retrieve_relevant(url: str, query: str, k: int = 2, char_cap: int = 4000) -> str:
    '''Retrieve most relevant chunks'''
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)

    docs = vs.similarity_search(query, k=k, filter={"source": url})
    text = "\n\n".join(getattr(d, "page_content", str(d)) for d in docs)
    return text[:char_cap]

def _list_presets() -> list[dict]:
    '''Builds a list of cached URLs with chunk counts and last-scraped timestamps, sorted newest first.'''
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    metas = (vs._collection.get(include=["metadatas"]) or {}).get("metadatas") or []

    by_source = {}
    for m in metas:
        src = m.get("source")
        if not src:
            continue
        info = by_source.setdefault(src, {
            "url": src,
            "chunk_count": 0,
            "last_scraped_at": None,
            "last_scrape_duration": None,
            "doc_id": m.get("doc_id", ""),
            "title": "",
            "description": "",
            "favicon": _host_favicon(src),
        })
        info["chunk_count"] += 1
        t = m.get("scraped_at")
        dur = m.get("duration_seconds")
        if t and (info["last_scraped_at"] is None or t > info["last_scraped_at"]):
            info["last_scraped_at"] = t
            if dur is not None:
               info["last_scrape_duration"] = dur
        elif info["last_scrape_duration"] is None and dur is not None:
            info["last_scrape_duration"] = dur

        if not info["title"] and m.get("site_title"):
            info["title"] = m["site_title"]
        if not info["description"] and m.get("site_description"):
            info["description"] = m["site_description"]
        if (not info["favicon"]) and m.get("favicon"):
            info["favicon"] = m["favicon"]

    return sorted(
        by_source.values(),
        key=lambda x: x["last_scraped_at"] or "",
        reverse=True,
    )

def _url_cached(source_url: str) -> dict | None:
    '''Checks if the vector store already contains data for the URL and returns minimal cache info if found.'''
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)

    meta = vs._collection.get(
        where={"source": {"$eq": source_url}},
        include=["metadatas"],
        limit=1,
    )
    if meta.get("metadatas"):
        base = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:12]
        return {"cached": True, "doc_id": base}
    return None

def _host_favicon(u: str) -> str:
    try:
        p = urlparse(u)
        return urljoin(f"{p.scheme}://{p.netloc}", "/favicon.ico")
    except Exception:
        return ""

def _get_last_duration(url: str):
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    metas = (vs._collection.get(
        where={"source": {"$eq": url}},
        include=["metadatas"]
    ) or {}).get("metadatas") or []

    best_t, best_dur = None, None
    for m in metas:
        t = m.get("scraped_at")
        if t and (best_t is None or t > best_t):
            best_t = t
            best_dur = m.get("duration_seconds")
    return best_dur

def _last_scraped_at(url: str) -> datetime | None:
    """Return most recent scraped_at for URL, or None."""
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    metas = (vs._collection.get(
        where={"source": {"$eq": url}},
        include=["metadatas"]
    ) or {}).get("metadatas") or []
    latest = None
    for m in metas:
        ts = m.get("scraped_at")
        if not ts:
            continue
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            continue
        if latest is None or dt > latest:
            latest = dt
    return latest

def _valid_http_url(u: str) -> bool:
    try:
        p = urlparse((u or "").strip())
        return p.scheme in ("http", "https") and bool(p.netloc)
    except Exception:
        return False

def _get_url_lock(url: str) -> threading.Lock:
    """Return a threading.Lock dedicated to this URL."""
    with _url_locks_guard:
        lock = _url_locks.get(url)
        if lock is None:
            lock = threading.Lock()
            _url_locks[url] = lock
        return lock

# ----- POST Requests -----

# Scrape POST request
@router.post("/scrape")
def api_scrape(req: ScrapeReq):
    '''Scrapes a URL (or uses cached data), stores chunks in memory, upserts them to Chroma, and returns a session_id.'''

    # Reject bad URLs
    if not _valid_http_url(req.url):
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "reason": "invalid_url",
                "message": "That URL doesn't look valid. Please include http:// or https:// and a real host."
            }
        )

    # Ensure only ONE scrape for this URL runs at a time
    lock = _get_url_lock(req.url)
    with lock:
        start_time = datetime.now(timezone.utc)
        cached = _url_cached(req.url)

        # Monhtly cool-down (block rescrape if < 30days since last scrape)
        if req.force:
            last = _last_scraped_at(req.url)
            if last:
                now = datetime.now(timezone.utc)
                next_allowed = last + timedelta(days=30)
                if now < next_allowed:
                    retry_after = int((next_allowed - now).total_seconds())
                    return JSONResponse(
                        status_code=429,
                        content={
                            "status": "cooldown",
                            "message": "Re-scrape blocked by 30-day cooldown.",
                            "url": req.url,
                            "last_scraped_at": last.isoformat(),
                            "next_allowed_at": next_allowed.isoformat(),
                        },
                        headers={"Retry-After": str(retry_after)},
                    )

        # If already cached and not forcing, just hand back a new session over cached data
        if cached and not req.force:
            session_id = str(uuid.uuid4())
            _session_url[session_id] = req.url
            _memory[session_id] = []
            _combined_text[session_id] = ""
            end_time = datetime.now(timezone.utc)
            duration_sec = (end_time - start_time).total_seconds()
            last_dur = _get_last_duration(req.url)
            return {
                "status": "ok",
                "session_id": session_id,
                "chunk_count": 0,
                "embedded_count": 0,
                "cache_hit": True,
                "url": req.url,
                "duration_seconds": duration_sec,
                "last_scrape_duration": last_dur,
            }

        # Otherwise, actually scrape
        try:
            data = scrape_website(req.url)
        except Exception as e:
            return JSONResponse(
                status_code=502,  # bad gateway: upstream site or network failed
                content={
                    "status": "error",
                    "reason": "unreachable",
                    "message": "We couldn't reach that website (it may be down, invalid, or returned 4xx/5xx).",
                    "detail": str(e),
                }
            )

        text = data.get("combined_text", "") or ""
        chunks = split_dom_content(text)
        site_meta = data.get("site_meta") or {
            "site_title": "", "site_description": "", "favicon": _host_favicon(req.url)
        }

        session_id = str(uuid.uuid4())
        _session_url[session_id] = req.url
        _memory[session_id] = chunks
        _combined_text[session_id] = text

        end_time = datetime.now(timezone.utc)
        duration_sec = (end_time - start_time).total_seconds()
        site_meta["duration_seconds"] = duration_sec
        added = upsert_chunks_into_vector_db(chunks, req.url, site_meta=site_meta)

        return {
            "status": "ok",
            "session_id": session_id,
            "chunk_count": len(chunks),
            "embedded_count": added,
            "cache_hit": bool(cached),
            "url": req.url,
            "site_meta": site_meta,
            "duration_seconds": duration_sec,
            "scraped_at": end_time.isoformat(),
        }


# ----- GET Requests -----
@router.get("/scrape/{session_id}/combined.txt")
def download_combined_text(session_id: str):
    '''Returns the raw combined scraped text for a fresh scrape as a downloadable .txt file.'''
    txt = _combined_text.get(session_id)
    if not txt:
        return PlainTextResponse("No combined text for this session.", status_code=404)
    url = _session_url.get(session_id, "")
    if url:
        base = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
        filename = f'combined_{base}.txt'
    else:
        filename = f'combined_{session_id}.txt'
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return PlainTextResponse(txt, media_type="text/plain", headers=headers)

@router.get("/presets")
def api_list_presets():
    '''Returns a list of cached URLs (presets) discovered in the vector store.'''
    return {"status": "ok", "presets": _list_presets()}

@router.get("/combined-by-url")
def download_combined_text_by_url(url: str = Query(...)):
    try:
        combined = _load_website_blob(url)
    except ValueError as e:
        return PlainTextResponse(str(e), status_code=404)
    base = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    headers = {"Content-Disposition": f'attachment; filename="combined_{base}.txt"'}
    return PlainTextResponse(combined, media_type="text/plain", headers=headers)

@router.get("/base-presets")
def api_base_presets():
    """Return list of unique base domains from vector DB."""
    emb = _build_embeddings()
    vs = _get_or_create_vs(emb)

    metas = vs._collection.get(include=["metadatas"]).get("metadatas") or []

    presets = {}  # base domain → aggregated info

    for m in metas:
        src = m.get("source")
        if not src:
            continue

        try:
            u = urlparse(src)
            base = f"{u.scheme}://{u.hostname.lower()}"
        except:
            continue

        entry = presets.setdefault(base, {
            "base": base,
            "title": "",
            "description": "",
            "favicon": f"{u.scheme}://{u.hostname}/favicon.ico",
            "last_scraped_at": None,
            "last_scrape_duration": None,
            "url": base,  # useful for frontend
        })

        # update metadata
        t = m.get("scraped_at")
        dur = m.get("duration_seconds")

        if t and (entry["last_scraped_at"] is None or t > entry["last_scraped_at"]):
            entry["last_scraped_at"] = t
            if dur is not None:
                entry["last_scrape_duration"] = dur

        if not entry["title"] and m.get("site_title"):
            entry["title"] = m["site_title"]

        if not entry["description"] and m.get("site_description"):
            entry["description"] = m["site_description"]

        if m.get("favicon"):
            entry["favicon"] = m["favicon"]

    return {"presets": list(presets.values())}

@router.get("/pages")
def api_pages(base: str = Query(...)):
    """Return all pages (full URLs) belonging to a given base domain."""
    emb = _build_embeddings()
    vs = _get_or_create_vs(emb)

    base = base.rstrip("/")  # normalize
    metas = vs._collection.get(include=["metadatas", "documents"]).get("metadatas") or []

    pages = []
    seen = set()

    for m in metas:
        src = m.get("source")
        if not src:
            continue

        if src.startswith(base) and src not in seen:
            seen.add(src)

            pages.append({
                "url": src,
                "title": m.get("site_title", ""),
                "description": m.get("site_description", ""),
                "favicon": m.get("favicon") or f"{base}/favicon.ico",
                "last_scraped_at": m.get("scraped_at"),
                "base": base,
            })

    return {"pages": pages}


# ----- Web Socket Routes -----
@router.websocket("/ws/website_chat")
async def website_chat_min(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Expect exactly one JSON frame with {url, message, model?, temperature?, ...}
            payload = await ws.receive_json()
            url = (payload.get("url") or "").strip()
            user_msg = (payload.get("message") or "").strip()
            model = payload.get("model", "gpt-4o-mini")
            temperature = float(payload.get("temperature", 0.3))
            reasoning = payload.get("reasoning_effort", "high")
            token_limit = int(payload.get("token_limit", 100_000))
            isAuth = bool(payload.get("isAuth", False))

            if not url or not user_msg:
                await ws.send_json({"error": "missing url or message"})
                await ws.close()
                return

            # Build “website blob” from Chroma
            context = _retrieve_relevant(url, user_msg, k=6, char_cap=20000)

            system_prompt = (
                    "You are a helpful assistant answering questions about a WEBSITE. "
                    "Use ONLY the WEBSITE CONTENT provided below. "
                    "Return VALID HTML ONLY (no markdown, no code fences). "
                    f"Keep answers concise (≤ {400} words). "
                    "\n\n[CONTEXT]\n"
                    f"{context}"
                )

            chat = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ]

            # Stream from your existing helper
            stream = request_openai_chat(
                chat,
                document_content="",
                model=model,
                temperature=temperature,
                reasoning_effort=reasoning,
                token_remaining=token_limit,
                isAuth=isAuth,
            )

            # Forward deltas as they arrive
            async for chunk in stream:
                if isinstance(chunk, (bytes, bytearray)):
                    chunk = chunk.decode("utf-8", "ignore")

                if not isinstance(chunk, str):
                    try:
                        await ws.send_json(chunk)
                    except Exception:
                        pass
                    continue
                s = chunk.strip()

                if not s or s == "[DONE]":
                    continue
                
                if s.startswith("data:"):
                    s = s[5:].lstrip()

                try:
                    payload_json = json.loads(s)
                except Exception:
                    continue

                await ws.send_json(payload_json)

            await ws.send_json({"done": True})
    except WebSocketDisconnect:
        return
    except Exception as e:
        try:
            await ws.send_json({"error": str(e)})
            await ws.close()
        except Exception:
            pass
