# DFO PSSI AI Portal
## Description
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

### 2. Clone the Repository
Clone the repository to your local machine with the following command:
```bash
git clone https://github.com/dfo-mpo/openAI-Chatbot.git
cd openAI-Chatbot
```

### 3. Run the Frontend
#### 3.1 Install Dependencies
Install all required dependencies by running the following command in the project directory:
```bash
npm install
```
#### 3.2 Start React Project
To run the frontend project use the following command:
```bash
npm run dev
```
The terminal will output the local host path that can be pasted into a web brower to use the React frontend.

### 4. Run the Backend
#### 4.1 Setup .env File
Go to backend/ai_ml_tools, then copy and rename the '.env.example' file to '.env'. Make sure to add in the keys needed for OpenAI and Document Intelligence.
#### 4.2 Setup and Run (With Bash Script)
Open a new terminal window at the root of the repository and go the backend, install the requirments into a virtual enviroment, and run the backend with the following commands:
```bash
cd backend
./setup_and_run.sh
```
#### 4.3 Running in the Future (With Bash Script)
After intially using the setup_and_run script, you can use the dev script instead to run the backend in the future:
```bash
./dev.sh
```
#### 4.4 (Optional) Manually Running the backend
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
