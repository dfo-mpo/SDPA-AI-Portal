## Frontend Image Logic
The frontend is implemented using Reactjs, the root of this project contains the dockerfile.frontend for creating its image. It uses Node 22.12.0 and for installing depedencies the package and package-lock jsons. The nginx-app.conf file will create a reverse proxy that allows HTTPS and WSS requests from the frontend image to be internally sent to the backend image as HTTP and WS requests. This allows the frontend and backend images communcate with out exposing non secure requests. The nginx-app.conf file also has a max file size limit set for all requests passed through the reverse proxy. It is exposed to port 80.<br>
Due to nginx proxy, requests to the express server should begin with /server/ while requests to the backend should begin with /api/. The backend will receive requests with the /api/ part removed while the express server will receive requests with the /server/ part replaced with /api/.

## Tools Included
- **AI ChatBot**: Allows real-time conversations with PDF documents, making it suitable for general inquiries and simple prompts.
- **CSV/PDF Analyzer**: Analyzes and extracts information from PDF documents by uploading the document along with a CSV file containing engineered prompts.
- **Sensitivity Score Calculator**: Computes the sensitivity level of uploaded documents based on custom parameters.
- **Redactor**: Scans and redacts specific information from uploaded PDF documents.