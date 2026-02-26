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
1. Go to the `backend/ai_ml_tools/routers` folder. 
    * If you are adding a route for a new tool, copy and rename the `template_router.py` file. 
    *  If a file for your tool already exits, open that file. 

2. Add the logic for the HTTP and/or WS routes as needed. Helper functions can be added to the `ai_ml_tools/utils` folder and class definitions can be added to the `ai_ml_tools/models` folder then imported into the router file. 

3. After building the new routers, go to the `backend/ai_ml_tools/routers/__init__.py` file. Ensure your router file is imported and included using the `include_router()` function. 

Next time the backend is run, it will now serve the new routes that have been added.

## Supported APIs 
### HTTP Requests Handled Internally 
Requests handled in the `ai_ml_tools/routers/age_scale.py` file: 
- HTTP"/age_scale/" - `POST` request that takes a `TIFF` image, preprocess it, then calls an external VM with HTTP post request to obtain and return the model predicted age of the fish. 
- HTTP"/to_png" - `POST` request that a `TIFF` image, convert it to a `PNG` file, then return it. 

Requests handled in the `ai_ml_tools/routers/aml.py` file: 
- HTTP”/models” - `GET` request that retrieves all models in the Azure Machine Learning Workspace. 
- HTTP "/models/{name}/versions" - `GET` request that retrieves all versions of the model based on name provided in `{name}`. 
- HTTP "/models/{name}/versions/{version}/download.zip" - `GET` request that retrieves the files and folders for the model and version specified by `{name}` and `{version}` respectively. The retrieved files are converted into a `.zip` file before being returned.  
- HTTP "/models/{name}/versions/{version}/readme" - `GET` request that retrieves the `README` file if it exists from the model and version specified by `{name}` and `{version}` respectively. 

Requests handled in the `ai_ml_tools/routers/analyzer.py` file: 
- HTTP"/openai_csv_analyze/" - `POST` request that takes both a `CSV` and `PDF`. Reads the `CSV` and applies those prompts to the `PDF` using LLM. Returns the model responses in the from of a `JSON`, `CSV`, or `TXT` depending on what the `outputType` input is set too. 

Requests handled in the `ai_ml_tools/routers/chatbot.py` file: 
- HTTP"/di_extract_document/" - `POST` request that takes a `PDF` document then uses an Azure document intelligence prebuilt model to convert the `PDF` into a stringified `JSON` and return it. 
- WS"/ws/chat_stream" - `Web socket` that will create chunked objects with documents string, get relevant chunks to the given question using an embedding model, then ask the question on the selected document chunks with a LLM, the response is returned as a stream (in chunks). 
- HTTP"/di_chunk_single_document/" - `POST` request that takes a single `PDF` document and uses an Azure document intelligence prebuilt model to convert a `PDF` into markdown chunks, they are combined into a `JSON` containing text chunks and metadata then returned. 
- HTTP"/di_chunk_ multi_document/" - `POST` request that takes multiple `PDF` documents and uses an Azure document intelligence prebuilt model to convert a `PDF` into markdown chunks, they are combined into a `JSON` containing text chunks and metadata then returned. 

Requests handled in the `ai_ml_tools/routers/classification_predict.py` file: <br>
**This tool is currently under development**, and requests are activity changing in this file. Documentation will be added once this tool is complete. 

Requests handled in the `ai_ml_tools/routers/documentOcr.py` file: 
- HTTP”/index” - `POST` request that takes a set of PDF files, extracts text from multiple documents using Azure document intelligence, creates a vector store, then returns the vector store. 
- HTTP” /extract_per_file” - `POST` request that takes the vector store ID, fields, document names, and model type. It will apply a LLM to extract the specified fields from the documents and return for each document the name, fields, LLM answers, sources, and reasonings. 

Requests handled in the `ai_ml_tools/routers/fence_count.py` file: 
- HTTP"/fence_counting/" - `POST` request that takes a file name and returns a cached output video based on the inputted file name. 

Requests handled in the `ai_ml_tools/routers/french_translation.py` file: 
- HTTP"/pdf_to_french/" - `POST` request that takes in a `PDF`, extracts the raw text, then redirects to `/text_to_french/` HTTP request. 
- HTTP"/text_to_french/" - `POST` request that takes in raw text then calls external VM with HTTP request to convert the text to French, the text response from the VM is returned. 

Requests handled in the `ai_ml_tools/routers/pii_redact.py` file: 
- HTTP"/pii_redact/" - `POST` request that takes in a `PDF`, uses the `fitz` library to extract the text, determines sensitive information using `presidio`, redacts sensitive information, then returns the redacted `PDF`. 

Requests handled in the `ai_ml_tools/routers/sensitivity_score.py` file: 
- HTTP"/sensitivity_score/" - `POST` request that takes in a `PDF`, uses the `fitz` library to extract the text, determines all sensitive information by type using `presidio`, then returns a calculated sensitivity score. 

Requests handled in the `ai_ml_tools/routers/web_scraper.py` file: 
- HTTP "/scrape" - `POST` request that takes a `URL` and scrapes a it (or uses cached data), stores chunks in memory, upserts them to `Chroma`, and returns a session_id. 
- HTTP "/scrape/{session_id}/combined.txt" - `GET` request that retrieves and returns the raw combined scraped text for a fresh scrape as a downloadable `TXT` file. Scraped text is from the `URL` scape tied to the provided `{session_id}`. 
- HTTP "/presets" - `GET` request that returns a list of cached `URLs` (presets) discovered in the vector store. 
- HTTP "/combined-by-url" - `GET` request that combines all the chunks from a single `URL` into a string which is then returned in a `TXT` file. 
- HTTP "/base-presets" - `GET` request that retrieves and returns a list of the unique base domains from vector DB. 
- HTTP "/pages" - `GET` request that retrieves and returns all pages (full `URLs`) belonging to a given base domain. 
- WS "/ws/website_chat" - `Web socket` that takes a user’s question, retrieves relevant chunks from the vector store for the given `URL`, then applied LLM to generate a response that gets returned.  

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