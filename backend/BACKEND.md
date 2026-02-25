# Backend Image Logic
## Framework/structure
The backend is implemented using fastapi/uvicorn, the backend folder contains the dockerfile for creating its image. It uses Python 3.10 and imports all packages specified in the requirments.txt file. It is exposed to port 8000 but the port is not directly used by the frontend due to the reverse proxy.<br>
<b>Important:</b> There are 2 urls for HTTP requests to the VM that need to be manually uncommented (one for Azure and one for a local machine). This is in routers/age_scale.py and routers/french_translations.py
### Chroma Storage
Since Azure does not support volumes like native docker does, a file share is used. The steps in setting this are:
1. Create a new file share in an Azure Storage Account, call it chroma.
2. In the Azure web app resource go to path mappings and add a new storage mount. Call it `chroma-store`, connect it to the file share just created, and set the mount path to `/home/chroma_store`.
3. In the Azure web app resource go to enviroment variables and set `WEBSITES_ENABLE_APP_SERVICE_STORAGE` to `true`.

## Environment Configuration

## Protection of Keys with Azure Key Vault

## Docker Volumes and Choma Storage

## Adding a New API Route

## Supported APIs
### Azure AI
We utilize Azure AI to power the AI ChatBot and CSV/PDF Analyzer. Azure AI provides advanced machine learning models that can interpret and respond to user queries, and analyze text data extracted from documents. This integration allows for:
- Enhanced natural language processing for real-time conversation with documents.
- Sophisticated data extraction and analysis from CSV and PDF files, enabling deep insights into document contents.

### Document Intelligence
Document Intelligence is used to read and interpret the contents of documents uploaded to the web application. It helps in:
- Automatically extracting text and data from structured and unstructured documents.

- HTTP"/age_scale/" - Takes a TIFF image, preprocess it, then calls external VM with HTTP request to get scale age which is returned.
- HTTP"/to_png" - Takes a TIFF image and returns it converted to PNG.
- HTTP"/openai_csv_analyze/" - Takes both a CSV and PDF. Reads the CSV and applies those prompts to the PDF using LLM. Returns the model responces.
- HTTP"/di_extract_document/" - Uses document intelligence to convert a PDF into a stringified JSON and return it.
- WS"/ws/chat_stream" - Web socket that will ask a question on a document with a LLM, the responce is returned as a stream (in chunks)
- HTTP"/di_chunk_document/" - Uses document intelligence to convert a PDF into markdown chunks, they are combined into a single string and returned.
- WS"/ws/rag_stream/" - Web socket that will create chunked objects with documents string, get relvent chunks to the given question, then ask the question on the selected document chunks with a LLM, the responce is returned as a stream (in chunks)
- HTTP"/fence_counting/" - Preprocess uploaded mp4 video and calls external VM with HTTP request and returns the responce which is an anotated video.
- HTTP"/pdf_to_french/" - Takes in a PDF, extracts the raw text, then redirects to "/text_to_french/" HTTP request.
- HTTP"/text_to_french/" - Takes in raw text then calls external VM with HTTP request to convert the text to French, the responce is returned.
- HTTP"/pii_redact/" - Takes in a PDF, determines sensitive information, redacts sensitive information, then returns the redacted PDF.
- HTTP"/sensitivity_score/" - Takes in a PDF, determines all sensitive information by type, then returns a calculated sensitivity score.