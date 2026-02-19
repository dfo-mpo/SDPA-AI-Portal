# Server Component Logic
## Framework/Structure 

### Purpose and Scope 
The server component is a Node.js/Express service located under `./server`. This component is distinct from the AI Hub’s primary “backend” (FastAPI service). It exists specifically to support: 
1. AI Intake Form: Survey submission handling 
2. Document retrieval and editing (WebViewer  package integration) 

The server component does not provide AI model functionality or VM communication. Its responsibility is limited to handling blob-based data storage required by frontend components. 

The server is deployed as a separate Docker container. It is distinct from the FastAPI backend container. 

### Technology Stack and Architecture 
The server is implemented mainly using Node.js, Express.js and `@azure/storage-blob`. It exposes REST-style API endpoints under `/api/*`. 

The server acts as an API layer between `Frontend (React) -> Express Server -> Azure Blob Storage`. All persistent data handled by this server is stored in Azure Blob Storage. No database is used. 

## Environment Configuration 
Ther server uses environment variables stored in `server\.env`. The required environment variables are used to construct a connecting string dynamically inside `server\services\azureBlobClient.js`. The Azure Blob client is instantiated per request using the Azure SDK. 

## Route Structure 
The server organizes functionality into modular route files under `server\routes`. Each route file registers endpoints under `/api`. 

## Use Case: AI Intake Form Handling 
### Purpose 
The AI Intake Form allows users to submit structured responses. The server processes and stores these submissions in Azure Blob Storage as a CSV file. 

### Architectural Role 
The server acts as a persistence layer between the frontend and Azure Blob Storage. 
- Receives structured `JSON` payloads 
- Converts data into a flat file format (`CSV`) 
- Writes the file to Azure Blob Storage 

No database is used. Blob Storage serves as the sole persistence layer for survey data. 

## Use Case: Document Retrieval and Editing (WebViewer Integration) 
### Purpose 
The server provides file-based endpoints to support document viewing and editing within the frontend using Apryse WebViewer: [WebViewer: JavaScript Document SDK | Apryse](https://apryse.com/products/webviewer). 

### Architectural Role 
The server acts as a secure file gateway between the frontend of the WebViewer and Azure Blob Storage. It exposes 
- A `GET` endpoint to stream documents from Blob Storage 
- A `POST` endpoint to upload updated documents back to Blob 

The server does not modify document content, as the document editing one of the WebViewer features. It performs file transfer and storage operations only. 

## Relationship with Frontend 
The server is consumed by the frontend via relative API paths: 
- AI Intake Form submission: `/server/storeResponse ` 
- WebViewer document retrieval: `/server/docx/... ` 
- WebViewer document save: `/server/docx/saveEdits ` 

The server does not render UI or manage sessions. It acts strictly as data storage intermediary and document file gateway. 