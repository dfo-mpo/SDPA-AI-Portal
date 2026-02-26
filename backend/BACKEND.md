# Backend Image Logic
## Framework/structure
The backend component is a [Unvicorn](https://uvicorn.dev/) project (which is running FastAPI and Python v3.10) located under `./backend/` with all source code found in `./backend/ai_ml_tools/`. This component handles all API requests from the frontend for AI/ML related models and tools. 

Using a terminal shell, the frontend can be started by running the `uvicorn ai_ml_tools.main:app --port 8000 ` command. It is recommended to use a virtual environment which is included in the `.gitingore` and `./backend/.dockerignore` files to prevent unnecessary copying of the virtual environment.  

When using Docker, it is deployed as its own container with a volume for a Chroma storage. 

All dependencies used in this component are defined in the `requirements.txt` file, and it is important to use Python v3.10 as other python versions will likely fail when installing the libraries. 

Multiple VMs (local and on Azure) have been used for hosting the models for Scale Ageing and French Translations. To update which VM the backend should connect too, modify the `http_api` path found in `ai_ml_tools/routers/age_scale.py` and `ai_ml_tools/routers/french_translations.py`. 

## Environment Configuration and Azure Key Vault 
The backend uses environment variables stored in `backend/ai_ml_tools/.env`. The required environment variables are used to create connections to OpenAI models, Document Intelligence, Azure Machine Learning Workspace, and computer vision models. Some are read on startup while others are dynamically read during API calls. 

When running locally, the keys should be included for the AI Hub to function properly; however, they are not needed when deploying to Azure due to the use of Azure Key Vault (AKV). Each key that should be deleted before pushing to Azure is indicated by a comment in the `.env.sample` file stating to leave it blank when pushing to Azure. 

The file `ai_ml_tools/core/keyvault.py` establishes the connection to AKV or determines if AKV is not being used. This is dependent if the ` KEY_VAULT_NAME` environment variable is present (which is only found in the Azure Web App not the `.env` file). 

The file `ai_ml_tools/core/secrets.py` contains the `get_secret(name)` function to either retrieve the key from the environment variables or from AKV, using a cache to limit the number of external requests made. 

The file `ai_ml_tools/utils/azure_key_vault.py` contains the helper functions that call the `get_secret(name)` function used by any other file needing to retrieve keys in the backend for external API calls. 

## Choma Storage in Volumes and File Share 
The Web Scraper tool uses `langchain_chroma` for storing collected content when scraping websites which can then be filtered by an embedding model before being used to answer a user’s question with OpenAI. To ensure a website only needs to be scraped once, persistent storage is needed for the Chroma database. 

To allow persistent storage of the Chroma data, the `docker-compose.yml` file creates the volume `chroma_store:/home/chroma_store` in the backend. The web scraper tool then needs to define `/home/chroma_store`as the persistent directory when defining the Chroma database to access the volume. 

A complication is introduced when deploying the AI Hub on Azure Web Apps. This is because Azure does not support volumes like native docker does. To solve this issue, an Azure Storage Account file share can be used in place of the docker volume. The steps in setting this Azure file share are: 

1. Create a new file share in an Azure Storage Account (in the File Shares section), call it `chroma`. The recommended access tier is `hot`.  

2. In the Azure Web App resource, go to path mappings found under the Configuration page and add a new storage mount. 
    * Set the name to `chroma-store` 
    * Set the account name to the Azure Storage Account used for the file share. 
    * Select `Azure Files` as storage type 
    * Select `SMB` for protocal 
    * Choose your file share for the storage container 
    * Set the mount path to `/home/chroma_store` 
    * Click on the add button 

3. In the Azure web app resource, go to environment variables and set `WEBSITES_ENABLE_APP_SERVICE_STORAGE` to `true`. Click on Apply to update the variable, then click Apply on the variables page to save the change. 

## Adding a New API Route

## Supported APIs 
### HTTP Requests Handled Internally 
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

### External APIs Used 
#### Azure OpenAI 
Azure Open AI is used for large language models for generating AI responses and embedding models for implementing RAG. The PDF Chatbot, CSV/PDF Analyzer, Web Scraper, and Document OCR tools rely on OpenAI models.  

Azure Open AI provides advanced machine learning models that can interpret and respond to user queries, and analyze text data extracted from documents. This integration allows for: 
* Enhanced natural language processing for real-time conversation with documents. 
* Sophisticated data extraction and analysis from various file formats, enabling deep insights into document content. 

#### Azure Document Intelligence 
Document Intelligence is used to read and interpret the contents of documents uploaded to the AI Hub’s PDF Chatbot, CSV/PDF Analyzer, PII Redactor, Sensitivity Score Calculator, French Translation, and Document OCR tools. It helps in: 
* Automatically extract text and data from structured and unstructured documents including non-machine-readable files. 
* Organize extracted text into markdown format allowing for LLMs and embedding models to easily process document text. 

#### Azure Machine Learning Workspace 
The Azure Machine Learning workspace is a central hub for managing all the artifacts and resources needed for machine learning projects. It provides a collaborative environment where teams can create, manage, and deploy machine learning models. It is used by the Models tool and helps in: 
* Acting as a cloud storage for AI/ML models that users can upload, explore, and manage through the AI Hub interface. 

#### Azure Custom Vision 
Custom Vision is used for custom built computer vision models, specifically for the Classification Model tool. Custom Vision allows for API calls directly to its existing models, this allows for the AI Hub too: 
* Have access to computer vision classification models that have been trained in the Custom Vision resource. 
* Process images uploaded on the AI Hub and use the computer vision model to provide a prediction with a confidence score. 

#### External VMs 
External VMs allow for tools to use more computationally heavy models without overburdening the backend component of the AI Hub. The Scale Ageing and French Translation tools use external VMs for hosting their models. The backend component manages the API connection to these VMs. 