from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse
from ai_ml_tools.utils.document_inteligence import get_content, get_vectors
from ai_ml_tools.utils.openai import request_openai_chat, get_relevent_chunks
from typing import List

router = APIRouter()  

# Performs DI extraction on document so document can be processed with openAI
@router.post("/di_extract_document/")
async def pdf_to_json_string(file: UploadFile = File(...)):
    refined_content = "Start of Document or pdf"
    refined_content += get_content(file, content=False, polygon=False, di_api="3.1")
    refined_content += "End of Document or pdf"

    return JSONResponse({"extracted_document": refined_content})

# Takes a string representing a document and model information then provides an LLM response as a stream
@router.post("/openai_question/")
async def llm_responce(chat_history: list, document: str, model: str, tempurature=0.3, reasoning_effort="high"):
    return StreamingResponse(request_openai_chat(chat_history, document_content=document, model=model, tempurature=tempurature, reasoning_effort=reasoning_effort), content_type='text/event-stream')

# Performs DI extraction and divides documents into chunks of markdown, to be used for RAG
@router.post("/di_chunk_document/")
async def pdf_to_chunks(files: List[UploadFile] = File(...)):
    text_chunks = []
    metadata = []
    for file in files:
        doc_chunks, doc_metadata = get_vectors(file, file.filename)
        text_chunks.extend(doc_chunks)
        metadata.extend(doc_metadata)

    print(f"Total number of chunks: {len(text_chunks)}")
    print(f"Metadata entries (must equal chunk number): {len(metadata)}")
    return JSONResponse({"text_chunks": text_chunks, "metadata": metadata})

# Takes  a document and model information then provides an LLM response
@router.post("/openai_question_rag/") # TODO: implement input for document chunks and metadata lists
async def llm_responce_rag(chat_history: list, document_vectors: str, model: str, tempurature=0.3, reasoning_effort="high"):
    # TODO: get list of document chunks and metadata
    document_chunks = ''
    document_metadata = {'document_name': '', 'page_number': ''}
    document_content = get_relevent_chunks(chat_history, document_chunks, document_metadata)

    return StreamingResponse(request_openai_chat(chat_history, document_content=document_content, model=model, type='rag', tempurature=tempurature, reasoning_effort=reasoning_effort), content_type='text/event-stream')