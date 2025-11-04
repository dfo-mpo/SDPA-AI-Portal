# ------ Imports ------
import os, uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from ai_ml_tools.utils.documentOcr.functions import (
    process_multiple_documents,
    create_vectorstore_from_multiple_documents,
    load_vectorstore,
    query_document,
    query_document_per_file,
)
load_dotenv()
router = APIRouter(prefix="/api", tags=["documentOcr"])


# ------ Classes ------
class SyncFileAdapter:
    def __init__(self, name: str, data: bytes):
        self._data = data
        self.name = name
    def read(self) -> bytes:
        return self._data

class IndexResponse(BaseModel):
    vectorstore_id: str
    processed_files: List[str]

class ExtractPerDocRequest(BaseModel):
    vectorstore_id: str
    fields: List[str]
    document_names: List[str]

class RowPerDoc(BaseModel):
    document: str
    field: str
    answer: str
    source: str
    reasoning: str

class ExtractPerDocResponse(BaseModel):
    results: List[RowPerDoc]


# ------ Routes ------
@router.get("/health")
def health():
    return {"ok": True}

# Index PDFs
@router.post("/index", response_model=IndexResponse)
async def index_pdfs(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    try:
        adapted = [SyncFileAdapter(f.filename, await f.read()) for f in files]
        documents = process_multiple_documents(
            uploaded_files=adapted,
            doc_intelligence_endpoint=None,
            doc_intelligence_key=None,
        )
        if not documents:
            raise HTTPException(status_code=422, detail="No text extracted from PDFs.")
        vectorstore_id = f"collection_{uuid.uuid4().hex[:12]}"
        create_vectorstore_from_multiple_documents(
            documents=documents,
            api_key=None,
            collection_name=vectorstore_id,
        )
        return IndexResponse(
            vectorstore_id=vectorstore_id,
            processed_files=[f.filename for f in files],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")

# Extract per document
@router.post("/extract_per_file", response_model=ExtractPerDocResponse)
async def extract_per_file(req: ExtractPerDocRequest):
    if not req.fields:
        raise HTTPException(status_code=400, detail="No fields supplied.")
    if not req.document_names:
        raise HTTPException(status_code=400, detail="document_names required.")

    try:
        vectorstore = load_vectorstore(file_name=req.vectorstore_id, api_key=None)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Vector store not found: {e}")

    try:
        per_doc = query_document_per_file(
            vectorstore=vectorstore,
            fields_list=req.fields,
            document_names=req.document_names,
            api_key=None,
            model_name=os.getenv("AZURE_OPENAI_DEPLOYMENT2"),
        )

        rows: List[RowPerDoc] = []
        for doc_name, df in per_doc.items():
            if getattr(df, "iterrows", None):
                for _, r in df.iterrows():
                    rows.append(
                        RowPerDoc(
                            document=str(r.get("Document", doc_name)),
                            field=str(r.get("Field", "")),
                            answer=str(r.get("Answer", "")),
                            source=str(r.get("Source", "")),
                            reasoning=str(r.get("Reasoning", "")),
                        )
                    )
        return ExtractPerDocResponse(results=rows)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Per-file extraction failed: {e}")
