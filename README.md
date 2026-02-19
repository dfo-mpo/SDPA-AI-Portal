# DFO AI Hub
This repository is for the DFO Office of the Chief Data Steward (OCDS) and Strategic Data Policy and Analytics (SDPA) AI Hub, a platform designed to explore the potential of artificial intelligence in fisheries and oceans research. Our initiatives harness the power of advanced data and A.I. technologies like machine learning, computer vision, and natural language processing to revolutionize how to support marine conservation and rebuilding efforts in the modern data and digital era.

These tools are prototypes designed to illustrate possible AI applications for DFO scientists, therefore, are strictly for educational purposes and are not to be used in any work processes. Please avoid uploading any sensitive or operational data if using this tool.

If you plan on contributing to new features, imporving the AI Hub, or updating Azure hosted instance check out the [CONTRIBUTE](CONTRIBUTE.md) page.

## Code Overview
The AI Hub is made up of 3 components:
- Frontend: Responsible for the interface users interact with and the authentication of users.
- Server: Handles requests from the frontend for forms and documents (blob-based data storage requests) hosted on the AI Hub.
- Backend: Handles requests from the frontend for all AI, ML, and computer vision models including the model repository.
### Frontend Framework
The frontend is implemented using React JS (version 18.3.1) with material UI (version 6.4.7) for many UI components. The code for this component can be found in the `./src` folder with `index.js` being the startup file/entry point. When using docker, this components dockerfile attaches an nginx instance (see `nginx-app.conf` in the root folder) to serve as a reverse proxy for requests to the server and backend. The frontend is structured as so:
- components - files containing smaller, reusable components, including logic for authenticating users to the portal.
- context - files used to manage global states (i.e. user authenticated, or current language).
- hooks - contains reusable logic such as handling file upload for a button.
- layout - larger components that define the structure/layout of the AI Hub UI.
- pages - JS files that build each of the pages used in the AI Hub. Requests to the server are made directly from the pages that need to read or write to an Azure Blob Storage.
- services - logic for all requests made to the backend.
- styles - files containing CSS styling or overrides for material UI components.
- translations - files defining objects containing all English-French pairs for the AI Hub so it can support both languages.
- utils - helper and miscellaneous files used in the frontend.

See [FRONTEND](src/FRONTEND.md) for more details on this component. 
### Server Framework
The server is implemented using express JS (version 5.1.0). The code can be found in the `./server` folder and runs on the startup of the frontend when used in terminal or as its own image when using docker. It is exposed to port 4000 but when docker is used, the port is only accessed via a reverse proxy. The server is structured as so:
- routes - contains logic for handling and responding to API requests.
- services - contains logic for establishing connections to cloud resources being used (Azure Blob Storage).

See [SERVER](server/SERVER.md) for more details on this component. 

### Backend Framework
The backend is implemented using Python (version 3.10) with a FastAPI and Uvicorn framework. The code can be found in the `./backend/ai_ml_tools` folder and initiated with the main.py file. The backend is structured as so:
- routers - contains logic for handling and responding to API requests.
- models - contains Python classes used by the backend
- utils - contains Python helper functions for the routers
- core - contains any configuration files as needed
- data - contains cached responses for dev use

See [BACKEND](backend/BACKEND.md) for more details on this component.


## Building the Docker Container Locally
This branch is setup to use docker for running the AI Hub, checkout the [local_dev](https://github.com/dfo-mpo/SDPA-AI-Portal/tree/local_dev) branch for running each component in terminal. <br>
The docker-compose.yml file will allow for a docker container be created using the frontend, server, and backend images. It reroutes the frontend exposure port to 3080 while rerouting the backend port to 8080.
### Prerequisites (if you don't already have docker)
1. First you need to install the Linux subsystem for Windows, open a PowerShell or Command Prompt terminal using Admin Privileges and run the following command: 
```bash
wsl --install 
```
You may need to restart the computer after this step.

2. Ensure you have docker installed on your device, see link to [downloading docker](https://docs.docker.com/desktop/setup/install/windows-install/).
### Steps to run container locally
To set up your container locally:
1. In the `./backend/ai_ml_tools` folder, copy and rename the '.env.sample' file to '.env'. Fill in the keys for OpenAI, Document Intelligence, and other APIs used.
2. In the `./server/` folder, copy and rename the '.env.sample' file to 'env'. Fill in the details for an Azure storage account to connect too.
3. In the `./src/components/auth/` folder, copy and rename the 'authConfig.example.js' into 'authConfig.js'. Make sure to add in the values for clientId, authority, redirectURI, and postLogoutRedirectUri.
4. Build the local docker container using the command:
```bash
# Use this command if your docker engine version is below 20.10
docker-compose up --build

# Use this command if you have docker engine v20.10 or newer
docker compose up --build
```
You can now use the web app locally from, http://localhost:3080