# Imports
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Dict, List
import uuid
from ai_ml_tools.utils.webScraper.scrape import scrape_website, split_dom_content
from ai_ml_tools.utils.webScraper.parse import parse_with_azure_llm
import os, hashlib
from langchain_openai import AzureOpenAIEmbeddings
from langchain_chroma import Chroma
from chromadb.config import Settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["web-scraper"])

_memory: Dict[str, List[str]] = {}
_combined_text: Dict[str, str] = {}

PERSIST_DIR = "chroma_store"
COLLECTION  = "web_chunks_v6"

os.environ.setdefault("CHROMA_TELEMETRY_ENABLED", "false")
os.environ.setdefault("ANONYMIZED_TELEMETRY", "false")

# Classes
class ScrapeReq(BaseModel):
    url: str

class ParseReq(BaseModel):
    parse_description: str
    session_id: str

class ParseByUrlReq(BaseModel):
    parse_description: str
    url: str


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

# insert chunks into the vector store 
def upsert_chunks_into_vector_db(chunks: list[str], source_url: str) -> int:
    '''Embeds the given text chunks, attaches metadata, and upserts them into the Chroma vector database.'''
    if not chunks:
        return 0
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)

    base = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:12]
    now  = datetime.now(timezone.utc).isoformat()
    ids = [f"{base}-{i}" for i in range(len(chunks))]
    metas = [{
        "source": source_url,
        "chunk_index": i,
        "doc_id": base,
        "scraped_at": now,
    } for i in range(len(chunks))]

    vectors = emb.embed_documents(chunks)
    vs._collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=vectors,
        metadatas=metas,
    )
    return len(chunks)


def _get_chunks_by_url(source_url: str) -> list[str]:
    '''Loads all stored text chunks for the given URL from Chroma and returns them in original order.'''
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    limit = 1000
    offset = 0
    all_docs, all_metas = [], []

    while True:
        data = vs._collection.get(
            where={"source": {"$eq": source_url}},
            include=["documents", "metadatas"],
            limit=limit,
            offset=offset,
        )
        docs  = data.get("documents") or []
        metas = data.get("metadatas") or []
        if not docs:
            break
        all_docs.extend(docs)
        all_metas.extend(metas)
        offset += len(docs)

    if not all_docs:
        return []

    paired = sorted(zip(all_docs, all_metas), key=lambda x: x[1].get("chunk_index", 0))
    return [d for d, _ in paired]

def _list_presets() -> list[dict]:
    '''Builds a list of cached URLs with chunk counts and last-scraped timestamps, sorted newest first.'''
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)
    data = vs._collection.get(include=["metadatas"])
    metas = data.get("metadatas") or []

    by_source = {}
    for m in metas:
        src = m.get("source")
        if not src:
            continue
        info = by_source.setdefault(
            src, {"url": src, "chunk_count": 0, "last_scraped_at": None}
        )
        info["chunk_count"] += 1
        t = m.get("scraped_at")
        if t and (info["last_scraped_at"] is None or t > info["last_scraped_at"]):
            info["last_scraped_at"] = t

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



# ----- POST Requests -----

# Scrape POST request
@router.post("/scrape")
def api_scrape(req: ScrapeReq):
    '''Scrapes a URL (or uses cached data), stores chunks in memory, upserts them to Chroma, and returns a session_id.'''
    cached = _url_cached(req.url)
    if cached:
        session_id = str(uuid.uuid4())
        _memory[session_id] = []
        _combined_text[session_id] = ""
        return {
            "status": "ok",
            "session_id": session_id,
            "chunk_count": 0,
            "embedded_count": 0,
            "cache_hit": True,
            "url": req.url,
        }

    data = scrape_website(req.url)
    text = data.get("combined_text", "") or ""
    chunks = split_dom_content(text)

    session_id = str(uuid.uuid4())
    _memory[session_id] = chunks
    _combined_text[session_id] = text

    added = upsert_chunks_into_vector_db(chunks, req.url)

    return {
        "status": "ok",
        "session_id": session_id,
        "chunk_count": len(chunks),
        "embedded_count": added,
        "cache_hit": False,
        "url": req.url,
    }


# ----- POST Requests -----
@router.post("/parse")
def api_parse(req: ParseReq):
    '''Runs an LLM parse request against the in-memory scraped chunks for a given session_id.'''
    chunks = _memory.get(req.session_id)
    if not chunks:
        return {"status": "error", "error": "invalid session_id or nothing scraped"}
    result = parse_with_azure_llm(chunks, req.parse_description)
    return {"status": "ok", "result": result}

@router.post("/parse-by-url")
def api_parse_by_url(req: ParseByUrlReq):
    '''Runs an LLM parse request using cached chunks loaded directly from Chroma by URL.'''
    chunks = _get_chunks_by_url(req.url)
    if not chunks:
        return {"status": "error", "error": "URL not found in vector store. Scrape it first."}
    result = parse_with_azure_llm(chunks, req.parse_description)
    return {"status": "ok", "result": result}


# ----- GET Requests -----
@router.get("/scrape/{session_id}/combined.txt")
def download_combined_text(session_id: str):
    '''Returns the raw combined scraped text for a session as a downloadable .txt file.'''
    txt = _combined_text.get(session_id)
    if not txt:
        return PlainTextResponse("No combined text for this session.", status_code=404)
    headers = {"Content-Disposition": f'attachment; filename="combined_{session_id}.txt"'}
    return PlainTextResponse(txt, media_type="text/plain", headers=headers)

@router.get("/presets")
def api_list_presets():
    '''Returns a list of cached URLs (presets) discovered in the vector store.'''
    return {"status": "ok", "presets": _list_presets()}
