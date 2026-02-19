## Frontend Image Logic
The frontend is implemented using Reactjs, the root of this project contains the dockerfile.frontend for creating its image. It uses Node 22.12.0 and for installing depedencies the package and package-lock jsons. The nginx-app.conf file will create a reverse proxy that allows HTTPS and WSS requests from the frontend image to be internally sent to the backend image as HTTP and WS requests. This allows the frontend and backend images communcate with out exposing non secure requests. The nginx-app.conf file also has a max file size limit set for all requests passed through the reverse proxy. It is exposed to port 80.<br>
Due to nginx proxy, requests to the express server should begin with /server/ while requests to the backend should begin with /api/. The backend will receive requests with the /api/ part removed while the express server will receive requests with the /server/ part replaced with /api/.
 ## talk about translations
 ## talk about themes
## Requests and Routing for Server/Backend Communication
To simplify communication between the images/containers, a reverse nginx proxy is setup to reroute all requests from the frontend to the server or backend images. The nginx-app.conf file contains all reverse proxy logic.

Any file that communicates to the backend or server using an HTTP request to 'localhost' will need to have it's path updated to be '/api' for backend requests or '/server' for server requests.

<b>Important:</b> src/services/apiService.js is in the gitignore, if you are pulling from a different branch, changes to this file need to be manually pasted in. This is because the routing between the docker images differs due to a proxy.

## Authenticating Users into the Platform 
### Authentication Overview 
User authentication within the AI Hub frontend is implemented using Microsoft Entra ID through the Microsoft Authentication Library (MSAL) for Reach. 

The implementation follows Microsoft’s official guidance for React-based Page Applications (SPA):  
- [Get started with MSAL React - Microsoft Authentication Library for JavaScript | Microsoft Learn](https://learn.microsoft.com/en-us/entra/msal/javascript/react/getting-started?view=msal-js-latest)
- [Tutorial: Prepare a React single-page application for authentication - Microsoft identity platform | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-prepare-app?tabs=workforce-tenant)

The application uses the `@azure/msal-react` and `@azure/msal-browser` packages to handle authentication requests. 

### Prerequisites 
Authentication requires a registered application in Microsoft Entra ID configured as 
- Application type: Single Page Application (SPA) 
- Platform configuration: Redirect URI configured for the deployed URL 

The `Client ID` and `Tenant ID` are configured in the frontend authentication configuration file. 

### Configuration Structure 
MSAL configuration is defined in `src\components\auth\authConfig.js`. 

This configuration follows the structure provided in the MSAL React documentation, with environment specific credentials. The configuration initializes an MSAL instance used across the application. 

### Application Integration 
MSAL is integrated at the root of the React application. In `./src/App.js`, the application is wrapped in: 
- MsalProvider: provides authentication context across the component 
- AuthContext: custom lightweight wrapper used to simplify authentication state checks within UI components 

This design allows authentication state to be accessed globally without tightly coupling components to MSAL specific hooks. 

Authentication state is exposed via `AuthContext`, and UI components consume authentication state via `useAuth()`. 

### Login Behavior and Access Control Model 
The AI Hub does not enforce mandatory login on initial page load. Instead, it fllows a conditional access visibility model: 
- Users may browse publicly accessible content without authentication. 
- Certain components and features remain restricted until the user is authenticated. 
- When unauthenticated, a login button is displayed in the header; if authenticated, the login button is replaced by logout functionality. 

## Tools Included
- **AI ChatBot**: Allows real-time conversations with PDF documents, making it suitable for general inquiries and simple prompts.
- **CSV/PDF Analyzer**: Analyzes and extracts information from PDF documents by uploading the document along with a CSV file containing engineered prompts.
- **Sensitivity Score Calculator**: Computes the sensitivity level of uploaded documents based on custom parameters.
- **Redactor**: Scans and redacts specific information from uploaded PDF documents.