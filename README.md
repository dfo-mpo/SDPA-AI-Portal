# Deploying the AI/ML Portal Using Docker
Note: temp measure!  Right now there is a third image for an express server, this is not fully documented as it may be removed and intigrated into the backend or run externally going forward. Only setup needed for it is to copy the .env.example in the server folder to create a .env file with the proper keys. See storage account in the PSSIAIPortal subscription for credentials. Note that sdpa-ai-computervision-portal resource has the updated Config file (server image added which is not shown in this document).<br>
<b>Important:</b> src/services/apiService.js is in the gitignore, if you are pulling from a different branch, changes to this file need to be manually pasted in. This is because the routing between the docker images differs due to a proxy.
## Backend Image Logic
The backend is implemented using fastapi/uvicorn, the backend folder contains the dockerfile for creating its image. It uses Python 3.10 and imports all packages specified in the requirments.txt file. It is exposed to port 8000 but the port is not used by the frontend due to the reverse proxy.<br>
<b>Important:</b> There are 2 urls for HTTP requests to the VM that need to be manually uncommented (one for Azure and one for Dat's local machine). This is in routers/age_scale.py and routers/french_translations.py
## Frontend Image Logic
The frontend is implemented using Reactjs, the root of this project contains the dockerfile.frontend for creating its image. It uses Node 22.12.0 and for installing depedencies the package and package-lock jsons. The nginx-app.conf file will create a reverse proxy that allows HTTPS and WSS requests from the frontend image to be internally sent to the backend image as HTTP and WS requests. This allows the frontend and backend images communcate with out exposing non secure requests. The nginx-app.conf file also has a max file size limit set for all requests passed through the reverse proxy. It is exposed to port 80.
## Building the Docker Container Locally
The docker-compose.yml file will allow for a docker container be created using the frontend and backend images. It reroutes the frontend exposure port to 3080 while rerouting the backend port to 8080. To set up your container locally:
1. In the backend/ai_ml_tools folder, copy and rename the '.env.sample' file to '.env'. Fill in the keys for OpenAI and Document Intelligence.
2. Build the local docker container using the command:
```bash
docker-compose up --build
```
You can now use the web app locally from, http://127.0.0.1:3080
## Deploying the Docker Container on Azure Webapps
This approach will use Azure Container Registry to host the docker images and the Azure Web App will use a docker-compose file to build the container. This will require an already existing ACR resource, Azure Web App resource (with runtime set to container on creation), and both Docker and Azure CLI installed locally on your machine. 

### Prerequisites
#### Setup Web App Resource
1. Create an Azure Web App resource. Make sure that the option for Publish is set to *Container*.
2. Once the resource is created, open it and go into the *Configuration* page under settings and apply the following changes the click on save:
    * Set SCM Basic Auth Publishing Credentials to 'On'
    * Set FTP Basic Auth Publishing Credentials to 'On'
    * Set HTTPS Only to 'Off' (Only if any of your code makes external HTTP requests, the AI portal backend does to a VM with high GPU, make sure to understand the risks of non secure requests)
    * Set Always on to 'On' (Recomended)
    * Ensure HTTP version is set to 1.1, the proxy in frontend dockerfile is set up to use 1.1
3. Now go to the *Identity* page under the *System assigned* tab, set Status to 'On', press save, and copy the Object ID that is generated.
#### Setup Container Registry Resource
4. Create an Azure Container Registry, using defualt configurations.
5. Once the resouce is created, open it and go to the *Access control (IAM)* page. Then create a new role assignment for the Web App resource:
    * Click on the '+ Add' option to go to the role creation page. 
    * Under 'Role' select *AcrPull* then click next.
    * Under 'Memebers click on *Select members* and under the Object ID copied from step 3 into the search bar. Select the web app resource that appears. Click Next and finish the creation of the role assignment.
6. Now go to the *Properties* page and make sure the Admin user option is selected.
#### Install Docker Desktop (If you don't already have it on your device)
7. First you need to install the Linux subsystem for Windows, open a PowerShell or Command Prompt terminal using Admin Privileges and run the following command: 
```bash
wsl --install 
```
You may need to restart the computer after this step.

8. Download and install Docker Desktop from the Docker Website [Docker Downloads](https://docs.docker.com/desktop/setup/install/windows-install/). 

When prompted, ensure the Use WSL 2 instead of Hyper-V option on the Configuration page is selected 
#### Setup Terminal Connection
9. Download and install Azure CLI from Microsoft:
[Azure CLI Downloads](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows?pivots=msi). Note that you may need admin privileges to run the msi file.
10. Open a terminal on your PC and log into the azure subscription you wish to use:
```bash
az login
```
You will be shown all available subscriptions, select the one with your Azure Container registry. <br>
If the subscription you are looking for is in a tenant that does not appear, then you will need to login to that specific tenant: 
```bash
az login --tenant <tenantID>
```
Note SSC 163Oxygen tenantID is 8c1a4d93-d828-4d0e-9303-fd3bd611c822. You can find it as Directory ID when viewing directories in Azure. 

11. Log into your Azure Container Registry resource using the following command:
```bash
az acr login --name <acr_resource_name>
```
Where acr_resource is the name of the resource you want to push your docker images too.

### Create Deployment on Web App
1. In the backend/ai_ml_tools folder, copy and rename the '.env.sample' file to '.env'. Fill in the keys for OpenAI and Document Intelligence.
2. Build the local docker container using the command:
```bash
docker-compose up --build
```
3. Once you have built your local docker container you need to tag the images that have modifications.<br>
<b>Important:</b> If you tag and push a version (eg. v1, v2, ...) that already exists in the ACR resource, it will overwrite it.<br>
```bash
docker tag <project-foldername-lowercase>-backend <acr_resource_name>.azurecr.io/ai-ml-tools-backend:v1
docker tag <project-foldername-lowercase>-frontend <acr_resource_name>.azurecr.io/ai-ml-tools-frontend:v1
docker tag <project-foldername-lowercase>-server <acr_resource_name>.azurecr.io/ai-ml-tools-server:v1
```
4. Push your local images with changes to the ACR:
```bash
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-backend:v1
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-frontend:v1
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-server:v1
```
5. Go to your Azure Web App resource to the *Deployment Center* page then set up the container:
    * Make sure 'Source' is set to Container Registry.
    * Make sure 'Container type' is set to Docker Compose.
    * 'Authentication' Needs to be set to Admin Credentials
    * For 'Config' enter the following compose file (Replace the term 'latest' with the version you want to use such as v1, v2, ect):
    ```
    version: '3.8'  
    services:  
      frontend:  
        image: <your_registry_name>.azurecr.io/frontend:latest  
        ports:  
        - "3080:80"  
        depends_on:  
        - backend  
        - server
      backend:  
        image: <your_registry_name>.azurecr.io/backend:latest  
        ports:  
        - "8080:8000" 
      server:  
        image: <your_registry_name>.azurecr.io/server:latest  
        ports:  
        - "4080:4000"
    ```
    * (Optional) Set 'Continuous deployment' to 'On' if you want the website to update if push a new image versions.
    * Press Save, after your web app refreshes it will be running of the frontend and backend containers.

# DFO PSSI AI Portal
## Description
The DFO PSSI AI Portal is a web application equipped with a suite of AI and computer vision tools designed for document interaction and analysis. This application enables users to leverage powerful AI capabilities directly through their web browser. Built using FastAPI/Uvicorn, Python, CSS, HTML, React, and JavaScript.
The DFO PSSI AI Portal is a web application equipped with a suite of AI and computer vision tools designed for document interaction and analysis. This application enables users to leverage powerful AI capabilities directly through their web browser. Built using FastAPI/Uvicorn, Python, CSS, HTML, React, and JavaScript.

## Tools Included
- **AI ChatBot**: Allows real-time conversations with PDF documents, making it suitable for general inquiries and simple prompts.
- **CSV/PDF Analyzer**: Analyzes and extracts information from PDF documents by uploading the document along with a CSV file containing engineered prompts.
- **Sensitivity Score Calculator**: Computes the sensitivity level of uploaded documents based on custom parameters.
- **Redactor**: Scans and redacts specific information from uploaded PDF documents.
  
## Integration with Azure AI and Document Intelligence
### Azure AI
We utilize Azure AI to power the AI ChatBot and CSV/PDF Analyzer. Azure AI provides advanced machine learning models that can interpret and respond to user queries, and analyze text data extracted from documents. This integration allows for:
- Enhanced natural language processing for real-time conversation with documents.
- Sophisticated data extraction and analysis from CSV and PDF files, enabling deep insights into document contents.

### Document Intelligence
Document Intelligence is used to read and interpret the contents of documents uploaded to the web application. It helps in:
- Automatically extracting text and data from structured and unstructured documents.

## Code Overview
### Backend Framework
The backend is implemented using Python with a FastAPI and Uvicorn framework. The code can be found in the backend/ai_ml_tools folder and intiated with the main.py file. The backend is structured as so:
- routers - contains logic for handeling and responding to API requests.
- models - contains Python classes used by the backend
- utils - contains Python helper functions for the routers
- core - contains any configuration files as needed
- data - contains cached responces for dev use

### Frontend Framework
TODO: add high level overview

### Frontend/Backend API calls supported
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

## Prerequisites
Before you begin the setup process, make sure to install the following:
- Python 3.10
- pip (Python package installer)
- Node.js v22

## Setup Instructions

### 1. Install Python
Download and install Python 3.10 from the official website:
[Python Downloads](https://www.python.org/downloads/)
During installation, ensure to check the box that says 'Add Python 3.10 to PATH'.

### 2. Install Node.js
Download and install Node.js v22 from the official website:
[Node Downloads](https://nodejs.org/en/download)
Note that you will need admin privileges to run the install.

### 3. Clone the Repository
Clone the repository to your local machine with the following command:
```bash
git clone https://github.com/dfo-mpo/openAI-Chatbot.git
cd openAI-Chatbot
```

### 4. Run the Frontend
#### 4.1 Install Dependencies
Install all required dependencies by running the following command in the project directory:
```bash
npm install
```
#### 4.2 Start React Project
To run the frontend project use the following command:
```bash
npm run dev
```
The terminal will output the local host path that can be pasted into a web brower to use the React frontend.

### 5. Run the Backend
#### 5.1 Setup .env File
Go to backend/ai_ml_tools, then copy and rename the '.env.example' file to '.env'. Make sure to add in the keys needed for OpenAI and Document Intelligence.
#### 5.2 Setup and Run (With Bash Script)
Open a new terminal window at the root of the repository and go the backend, install the requirments into a virtual enviroment, and run the backend with the following commands:
```bash
cd backend
./setup_and_run.sh
```
#### 5.3 Running in the Future (With Bash Script)
After intially using the setup_and_run script, you can use the dev script instead to run the backend in the future:
```bash
./dev.sh
```
#### 5.4 (Optional) Manually Running the backend
Without the bash scripts, you need to start by going into the backend folder again:
```bash
cd backend
```
You can then activate your virtual enviroment (if using one) with the command:
```bash
./venv/Scripts/activate
```
Install required packages if you haven't already:
```bash
pip install -r requirements.txt 
```
To start the backend use the command:
```bash
python -m uvicorn ai_ml_tools.main:app --reload
```

## Using Docker
If you wish to deploy this using a docker container by creating images for the Frontend and Backend switch to the docker branch and read instructions in the README.md. Run the following command in root of your local repository to switch the branch:
```bash
git checkout docker
```
