# Imports
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
import uuid
from ai_ml_tools.utils.webScraper.scrape import scrape_website, split_dom_content
from ai_ml_tools.utils.webScraper.parse import parse_with_azure_llm

router = APIRouter(prefix="/api", tags=["web-scraper"])

_memory: Dict[str, List[str]] = {}

# Classes
class ScrapeReq(BaseModel):
    url: str

class ParseReq(BaseModel):
    parse_description: str
    session_id: str

# Scrape POST request
@router.post("/scrape")
def api_scrape(req: ScrapeReq):
    data = scrape_website(req.url)
    text = data.get("combined_text", "") or ""
    chunks = split_dom_content(text)

    session_id = str(uuid.uuid4())
    _memory[session_id] = chunks

    return {"status": "ok", "session_id": session_id, "chunk_count": len(chunks)}

# Parse POST request
@router.post("/parse")
def api_parse(req: ParseReq):
    chunks = _memory.get(req.session_id)
    if not chunks:
        return {"status": "error", "error": "invalid session_id or nothing scraped"}
    result = parse_with_azure_llm(chunks, req.parse_description)
    return {"status": "ok", "result": result}
