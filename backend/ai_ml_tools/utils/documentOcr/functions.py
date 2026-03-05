from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from ai_ml_tools.utils.azure_key_vault import get_OPENAI_API_KEY

import fitz  # PyMuPDF
import os
import tempfile
import uuid
import pandas as pd
import re, unicodedata
from difflib import SequenceMatcher
import warnings
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import io
import json
from dotenv import load_dotenv

load_dotenv()

import logging
for _name in ("pypdf", "PyPDF2"):
    logging.getLogger(_name).setLevel(logging.ERROR)

# Suppress PyPDF warnings about malformed PDFs
warnings.filterwarnings("ignore", message="Ignoring wrong pointing object")


# ─── Multi-provider model configuration ────────────────────────────────────

# The only model backed by the shared SDPA/OCDS Azure key (no user key needed)
FREE_MODEL = "gpt4omini"

# Azure OpenAI deployment names (resolved from env at startup)
AZURE_DEPLOYMENT_MAP: dict[str, str] = {
    "gpt4omini":  os.getenv("AZURE_OPENAI_GPT4_o_mini", ""),
    "gpt4o":      os.getenv("AZURE_OPENAI_GPT4_o", ""),
    "gpt41mini":  os.getenv("AZURE_OPENAI_GPT4_1_MINI", ""),
}

# Native (non-Azure) model strings passed directly to each provider's SDK
NATIVE_MODEL_STRINGS: dict[str, str] = {
    "claude-3-5-sonnet": "claude-3-5-sonnet-20241022",
    "claude-3-haiku":    "claude-3-haiku-20240307",
    "gemini-1.5-flash":  "gemini-1.5-flash",
    "gemini-1.5-pro":    "gemini-1.5-pro",
    "grok-2":            "grok-3",
}


def build_llm(model_type: str | None, api_key: str | None = None):
    """
    Factory – returns (llm, provider_tag) for the requested model.

    provider_tag is one of: "azure_openai" | "anthropic" | "google" | "xai"
    It is used downstream to select compatible `with_structured_output` kwargs.

    Rules:
    - gpt4omini  → AzureChatOpenAI, key from Azure Key Vault (shared SDPA/OCDS)
    - gpt4o / gpt41mini → AzureChatOpenAI, key supplied by the user
    - claude-*   → ChatAnthropic, key supplied by the user
    - gemini-*   → ChatGoogleGenerativeAI, key supplied by the user
    - grok-*     → ChatOpenAI pointed at xAI endpoint, key supplied by the user

    Raises ValueError for unknown model types or missing keys.
    """
    model_type = model_type or FREE_MODEL

    # ── Azure OpenAI models ─────────────────────────────────────────────────
    if model_type in AZURE_DEPLOYMENT_MAP:
        deployment = AZURE_DEPLOYMENT_MAP[model_type]
        if not deployment:
            raise ValueError(
                f"Azure deployment name for '{model_type}' is not configured. "
                "Check the relevant env variable (AZURE_OPENAI_GPT4_o / _o_mini / _4_1_MINI)."
            )

        # Only the shared default model uses the AKV key; all others need a user key
        if model_type == FREE_MODEL:
            resolved_key = get_OPENAI_API_KEY()
        else:
            if not api_key:
                raise ValueError(
                    f"A user-supplied API key is required for model '{model_type}'."
                )
            resolved_key = api_key

        llm = AzureChatOpenAI(
            azure_endpoint=os.getenv("OPENAI_API_ENDPOINT"),
            api_key=resolved_key,
            api_version=os.getenv("OPENAI_API_EMBEDDING_VERSION"),
            model=deployment,
            temperature=0,
            max_tokens=4000,
        )
        return llm, "azure_openai"

    # All non-Azure models require a user-supplied key
    if not api_key:
        raise ValueError(
            f"An API key is required for model '{model_type}'. "
            "Please enter it in the left-panel settings."
        )

    # ── Anthropic / Claude ──────────────────────────────────────────────────
    if model_type.startswith("claude"):
        try:
            from langchain_anthropic import ChatAnthropic
        except ImportError:
            raise ImportError(
                "langchain-anthropic is not installed. "
                "Run: pip install langchain-anthropic"
            )
        model_str = NATIVE_MODEL_STRINGS.get(model_type, model_type)
        llm = ChatAnthropic(
            model=model_str,
            api_key=api_key,
            temperature=0,
            max_tokens=4000,
        )
        return llm, "anthropic"

    # ── Google / Gemini ─────────────────────────────────────────────────────
    if model_type.startswith("gemini"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError:
            raise ImportError(
                "langchain-google-genai is not installed. "
                "Run: pip install langchain-google-genai"
            )
        model_str = NATIVE_MODEL_STRINGS.get(model_type, model_type)
        llm = ChatGoogleGenerativeAI(
            model=model_str,
            google_api_key=api_key,
            temperature=0,
            max_output_tokens=4000,
        )
        return llm, "google"

    # ── xAI / Grok (OpenAI-compatible endpoint) ─────────────────────────────
    if model_type.startswith("grok"):
        from langchain_openai import ChatOpenAI
        model_str = NATIVE_MODEL_STRINGS.get(model_type, model_type)
        llm = ChatOpenAI(
            model=model_str,
            api_key=api_key,
            base_url="https://api.x.ai/v1",
            temperature=0,
            max_tokens=4000,
        )
        return llm, "xai"

    raise ValueError(f"Unknown model type: '{model_type}'.")


# ─── Unchanged helpers ──────────────────────────────────────────────────────

def clean_filename(filename):
    """
    Remove "(number)" pattern from a filename 
    (because this could cause error when used as collection name when creating Chroma database).
    """
    new_filename = re.sub(r'\s\(\d+\)', '', filename)
    return new_filename

def process_document_with_ocr(uploaded_file, doc_intelligence_endpoint, doc_intelligence_key):
    """
    Process a PDF document using Azure Document Intelligence OCR API.
    """
    try:
        credential = AzureKeyCredential(doc_intelligence_key)
        doc_analysis_client = DocumentAnalysisClient(
            endpoint=doc_intelligence_endpoint, 
            credential=credential
        )
        
        file_content = uploaded_file.read()
        uploaded_file.seek(0)
        file_stream = io.BytesIO(file_content)
        
        poller = doc_analysis_client.begin_analyze_document(
            "prebuilt-layout",
            document=file_stream
        )
        result = poller.result()
        
        documents = []
        
        if result.pages:
            for page_num, page in enumerate(result.pages):
                page_text = ""
                
                if result.paragraphs:
                    page_paragraphs = [p for p in result.paragraphs 
                                     if any(span.page_number == page_num + 1 
                                           for span in p.spans)]
                    for paragraph in page_paragraphs:
                        page_text += paragraph.content + "\n\n"
                
                if not page_text.strip() and page.lines:
                    for line in page.lines:
                        page_text += line.content + "\n"
                
                if page_text.strip():
                    doc = Document(
                        page_content=page_text.strip(),
                        metadata={
                            "source": uploaded_file.name,
                            "page": page_num,
                            "extraction_method": "azure_document_intelligence",
                            "page_width": page.width if hasattr(page, 'width') else None,
                            "page_height": page.height if hasattr(page, 'height') else None,
                            "page_unit": page.unit if hasattr(page, 'unit') else None
                        }
                    )
                    documents.append(doc)
        
        if not documents and result.content:
            doc = Document(
                page_content=result.content,
                metadata={
                    "source": uploaded_file.name,
                    "page": 0,
                    "extraction_method": "azure_document_intelligence_fallback"
                }
            )
            documents.append(doc)
            
        return documents
        
    except Exception as e:
        raise Exception(f"Document Intelligence OCR failed: {str(e)}. Please check your endpoint and API key.")


def get_pdf_text_with_fallback(uploaded_file, doc_intelligence_endpoint=None, doc_intelligence_key=None):
    """
    Process PDF with Document Intelligence OCR first, fallback to PyPDF if needed.
    """
    if doc_intelligence_endpoint and doc_intelligence_key:
        try:
            return process_document_with_ocr(uploaded_file, doc_intelligence_endpoint, doc_intelligence_key)
        except Exception as ocr_error:
            print(f"OCR processing failed: {ocr_error}")
            print("Falling back to traditional PDF parsing...")
    
    return get_pdf_text_traditional(uploaded_file)


def get_pdf_text_traditional(uploaded_file): 
    """
    Load a PDF document using traditional PyPDF method (fallback).
    """
    try:
        input_file = uploaded_file.read()
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(input_file)
        temp_file.close()

        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message="Ignoring wrong pointing object")
            loader = PyPDFLoader(temp_file.name)
            documents = loader.load()

        return documents
    
    except Exception as e:
        raise Exception(f"Failed to parse PDF: {str(e)}. The PDF might be corrupted or password-protected.")
    
    finally:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)


def process_multiple_documents(uploaded_files, doc_intelligence_endpoint=None, doc_intelligence_key=None):
    """
    Process multiple PDF documents with OCR fallback.
    """
    all_documents = []
    
    for uploaded_file in uploaded_files:
        try:
            documents = get_pdf_text_with_fallback(
                uploaded_file, 
                doc_intelligence_endpoint, 
                doc_intelligence_key
            )
            all_documents.extend(documents)
            
        except Exception as e:
            print(f"Error processing {uploaded_file.name}: {str(e)}")
            continue
    
    return all_documents

def split_document(documents, chunk_size, chunk_overlap):    
    """
    Split generic text into smaller chunks with improved settings.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
        keep_separator=True
    )
    return text_splitter.split_documents(documents)


def get_embedding_function(api_key=None):
    """
    Return an AzureOpenAIEmbeddings object using the shared SDPA/OCDS key.
    Embeddings always use the Azure endpoint regardless of which LLM the user selected.
    """
    api_key = get_OPENAI_API_KEY()
    endpoint = os.getenv("OPENAI_API_ENDPOINT")
    api_version = os.getenv("OPENAI_API_EMBEDDING_VERSION")
    embed_deployment = os.getenv("AZURE_OPENAI_SMALL_EMBED_DEPLOYMENT")

    return AzureOpenAIEmbeddings(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
        model=embed_deployment,
    )


def create_vectorstore(chunks, embedding_function, collection_name, vector_store_path="db"):
    """
    Create a Chroma vector store from a list of text chunks.
    """
    ids = [str(uuid.uuid5(uuid.NAMESPACE_DNS, doc.page_content)) for doc in chunks]
    
    unique_ids = set()
    unique_chunks = []
    
    for chunk, id in zip(chunks, ids):     
        if id not in unique_ids:       
            unique_ids.add(id)
            unique_chunks.append(chunk)        

    vectorstore = Chroma.from_documents(
        documents=unique_chunks, 
        collection_name=clean_filename(collection_name),
        embedding=embedding_function, 
        ids=list(unique_ids), 
        persist_directory=vector_store_path,
    )
    return vectorstore


def create_vectorstore_from_multiple_documents(documents, api_key, collection_name="multi_doc_collection"):
    """
    Create a Chroma vector store from multiple documents.
    """
    docs = split_document(documents, chunk_size=1500, chunk_overlap=300)
    embedding_function = get_embedding_function(api_key)
    vectorstore = create_vectorstore(docs, embedding_function, collection_name)
    return vectorstore


def create_vectorstore_from_texts(documents, api_key, file_name, doc_intelligence_endpoint=None, doc_intelligence_key=None):
    """
    Create a vector store from a list of texts with OCR processing.
    """
    docs = split_document(documents, chunk_size=1500, chunk_overlap=300)
    embedding_function = get_embedding_function(api_key)
    vectorstore = create_vectorstore(docs, embedding_function, file_name)
    return vectorstore


def load_vectorstore(file_name, api_key, vectorstore_path="db"):
    """
    Load a previously saved Chroma vector store from disk.
    Embeddings always use the shared Azure key regardless of the user's LLM choice.
    """
    embedding_function = get_embedding_function(api_key)
    return Chroma(
        persist_directory=vectorstore_path, 
        embedding_function=embedding_function, 
        collection_name=clean_filename(file_name),
    )


# ─── Prompt ─────────────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """
You are an expert document analysis assistant. Your task is to extract specific information from the provided context.

INSTRUCTIONS:
1. Read through ALL the provided context carefully
2. Extract the requested information accurately
3. If information is not found, clearly state "Information not found in document"
4. Use EXACT text from the document when possible
5. For sources, quote the most relevant sentences directly
6. Be thorough in your reasoning - explain how you found the information
7. When dealing with multiple documents, specify which document the information comes from

CONTEXT:
{context}

---

EXTRACTION REQUEST: {question}

IMPORTANT: Base your answers ONLY on the provided context. Do not make assumptions or add information not present in the document(s).
"""


class AnswerWithSources(BaseModel):
    """An answer to the question, with sources and reasoning."""
    answer: str = Field(description="Concise paraphrase (1–2 sentences) in your own words; do NOT copy the source")
    sources: str = Field(description="Full direct text chunk from the context used to answer the question")
    reasoning: str = Field(description="Explain the reasoning of the answer based on the sources")


def create_dynamic_model(fields_list):
    """
    Create a dynamic Pydantic model based on user-specified fields.
    """
    field_definitions = {}
    
    for field in fields_list:
        clean_field = field.lower().replace(" ", "_").replace("-", "_")
        field_definitions[clean_field] = (AnswerWithSources, Field(description=f"Information about {field}"))
    
    DynamicExtractedInfo = type(
        "DynamicExtractedInfo",
        (BaseModel,),
        {
            "__annotations__": {name: field_type for name, (field_type, _) in field_definitions.items()},
            **{name: field_obj for name, (_, field_obj) in field_definitions.items()}
        }
    )
    return DynamicExtractedInfo


def format_docs(docs):
    """Format a list of Document objects into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)


def _apply_structured_output(llm, dynamic_model, provider: str):
    """
    Wrap `llm` with structured output using kwargs appropriate for each provider.

    - Azure OpenAI supports method="function_calling" + strict=False.
    - Anthropic, Google, and xAI use the default (tool_use / JSON mode).
    """
    if provider == "azure_openai":
        return llm.with_structured_output(dynamic_model, method="function_calling", strict=False)
    return llm.with_structured_output(dynamic_model)


# ─── Main extraction functions ───────────────────────────────────────────────

def query_document_per_file(
    vectorstore,
    fields_list,
    document_names,
    api_key=None,
    model_type=None,
):
    """
    Query a vector store with dynamic fields and return structured responses
    for each document.

    Parameters:
        vectorstore   – Chroma vectorstore object
        fields_list   – list of field names to extract
        document_names – list of PDF filenames to iterate over
        api_key       – user-supplied API key (None → AKV for gpt4omini)
        model_type    – frontend model key (e.g. "gpt4omini", "claude-3-5-sonnet")
    """
    llm, provider = build_llm(model_type, api_key)

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 30},
    )
    
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    DynamicModel    = create_dynamic_model(fields_list)
    structured_llm  = _apply_structured_output(llm, DynamicModel, provider)

    results_per_document = {}

    for doc_name in document_names:
        query = f"""Please extract the following specific information ONLY from the document named "{doc_name}":
        
        Fields to extract: {', '.join(fields_list)}
        
        For each field, provide:
        1. A concise paraphrase (1–2 sentences, your own words; do not copy) of what was found in "{doc_name}"
        2. The source text where you found it (from "{doc_name}" only)
        3. Your reasoning for the extraction
        
        IMPORTANT: Only extract information from the document "{doc_name}". If any field cannot be found in "{doc_name}" specifically, clearly state that it's not available in this document.
        
        Ignore information from other documents - focus only on "{doc_name}"."""

        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt_template
            | structured_llm
        )

        try:
            structured_response = rag_chain.invoke(query)
            response_dict       = structured_response.model_dump()
            
            document_rows = []
            for field_name, field_data in response_dict.items():
                readable_field = field_name.replace("_", " ").title()
                document_rows.append({
                    'Document':  doc_name,
                    'Field':     readable_field,
                    'Answer':    field_data['answer'],
                    'Source':    field_data['sources'],
                    'Reasoning': field_data['reasoning'],
                })
            
            results_per_document[doc_name] = pd.DataFrame(document_rows)
            
        except Exception as e:
            error_rows = [
                {
                    'Document':  doc_name,
                    'Field':     field,
                    'Answer':    f"Extraction failed: {str(e)}",
                    'Source':    "Error occurred during processing",
                    'Reasoning': "Please try with a different model or check if the document contains the requested information",
                }
                for field in fields_list
            ]
            results_per_document[doc_name] = pd.DataFrame(error_rows)
    
    return results_per_document


def query_document(vectorstore, fields_list, api_key=None, model_type=None):
    """
    Query a vector store with dynamic fields and return a structured response.
    (Kept for backward compatibility with single-document processing.)

    Parameters:
        vectorstore – Chroma vectorstore object
        fields_list – list of field names to extract
        api_key     – user-supplied API key (None → AKV for gpt4omini)
        model_type  – frontend model key
    """
    llm, provider = build_llm(model_type, api_key)

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 30},
    )
    
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    DynamicModel    = create_dynamic_model(fields_list)
    structured_llm  = _apply_structured_output(llm, DynamicModel, provider)

    query = f"""Please extract the following specific information from the document(s):
    
    Fields to extract: {', '.join(fields_list)}
    
    For each field, provide:
    1. A concise paraphrase (1–2 sentences, your own words; do not copy) of what was found
    2. The source text where you found it (include document name if multiple documents)
    3. Your reasoning for the extraction
    
    If any field cannot be found, clearly state that it's not available in the document(s)."""

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt_template
        | structured_llm
    )

    try:
        structured_response = rag_chain.invoke(query)
        response_dict       = structured_response.model_dump()
        
        df = pd.DataFrame([response_dict])

        answer_row   = []
        source_row   = []
        reasoning_row = []

        for col in df.columns:
            answer_row.append(df[col][0]['answer'])
            source_row.append(df[col][0]['sources'])
            reasoning_row.append(df[col][0]['reasoning'])

        structured_response_df = pd.DataFrame(
            [answer_row, source_row, reasoning_row], 
            columns=df.columns, 
            index=['answer', 'source', 'reasoning'],
        )
        return structured_response_df.T
        
    except Exception as e:
        error_df = pd.DataFrame({
            'Error': [
                f"Extraction failed: {str(e)}",
                "Please try with a different model or simpler fields",
                "Check if the document contains the requested information",
            ]
        }, index=['answer', 'source', 'reasoning'])
        return error_df


def parse_fields_from_upload(uploaded_file):
    '''
    Returns field names from a JSON or CSV file.
    Tries JSON first, then falls back to CSV.
    '''
    if uploaded_file is None:
        return []

    raw = uploaded_file.read()

    def detect_encoding(b: bytes) -> str:
        if b.startswith(b'\xff\xfe\x00\x00'): return 'utf-32le'
        if b.startswith(b'\x00\x00\xfe\xff'): return 'utf-32be'
        if b.startswith(b'\xef\xbb\xbf'):     return 'utf-8-sig'
        if b.startswith(b'\xff\xfe'):          return 'utf-16le'
        if b.startswith(b'\xfe\xff'):          return 'utf-16be'
        return 'utf-8'

    enc = detect_encoding(raw)
    
    try:
        text = raw.decode(enc)
        obj  = json.loads(text)

        if isinstance(obj, dict):
            return [str(k) for k in obj.keys()]
        
        if isinstance(obj, list):
            keys = set()
            for item in obj:
                if isinstance(item, dict):
                    keys.update(map(str, item.keys()))
            if keys:
                return sorted(keys)
    except Exception:
        pass

    try:
        text  = raw.decode(enc)
        first = next((ln for ln in text.splitlines() if ln.strip()), "")
        maybe = json.loads(first)
        if isinstance(maybe, dict):
            return [str(k) for k in maybe.keys()]
    except Exception:
        pass

    try:
        text = raw.decode(enc)
        df   = pd.read_csv(io.StringIO(text), nrows=0, engine='python', sep=None)
        cols = [str(c) for c in df.columns]
        if cols in (['['], [']']):
            return []
        return cols
    except Exception:
        return []