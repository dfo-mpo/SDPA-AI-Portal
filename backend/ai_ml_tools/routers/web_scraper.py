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

def _build_embeddings():
    return AzureOpenAIEmbeddings(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
        azure_deployment=os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT"),
    )

# get or create the vector database store
def _get_or_create_vs(emb):
    return Chroma(
        collection_name=COLLECTION,
        persist_directory=PERSIST_DIR,
        embedding_function=emb,
        client_settings=Settings(anonymized_telemetry=False),
    )

# insert chunks into the vector store 
def upsert_chunks_into_vector_db(chunks: list[str], source_url: str) -> int:
    if not chunks:
        return 0
    emb = _build_embeddings()
    vs  = _get_or_create_vs(emb)

    base = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:12]
    ids = [f"{base}-{i}" for i in range(len(chunks))]
    metas = [{"source": source_url, "chunk_index": i} for i in range(len(chunks))]

    vs.add_texts(texts=chunks, metadatas=metas, ids=ids)
    return len(chunks)

# Scrape POST request
@router.post("/scrape")
def api_scrape(req: ScrapeReq):
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
    }

@router.get("/scrape/{session_id}/combined.txt")
def download_combined_text(session_id: str):
    txt = _combined_text.get(session_id)
    if not txt:
        return PlainTextResponse("No combined text for this session.", status_code=404)
    headers = {"Content-Disposition": f'attachment; filename="combined_{session_id}.txt"'}
    return PlainTextResponse(txt, media_type="text/plain", headers=headers)

# Parse POST request
@router.post("/parse")
def api_parse(req: ParseReq):
    chunks = _memory.get(req.session_id)
    if not chunks:
        return {"status": "error", "error": "invalid session_id or nothing scraped"}
    result = parse_with_azure_llm(chunks, req.parse_description)
    return {"status": "ok", "result": result}
