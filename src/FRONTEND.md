# Frontend Image Logic
## Framework/Structure 
The frontend component is a React JS project located under `./src`. This component creates an interface where users interact with the AI Hub and its various tools.  

The frontend component does not have its own direct backend and processing any of the hosted tools is done by making requests to the server and backend components. 

Using a terminal shell, the frontend can be started by simply using the `npm run dev` command (which also starts up the server component). When using Docker, it is deployed as its own container. In this case, it is packaged with a nginx that servers as a reverse proxy. 

All dependencies used in this component are defined in the `package.json` and `package-lock.json` files. 

## Communicating with the Backend and Server 
All requests made to the backend component are handled in the `/services/apiService.js` file using helper functions called by various tool pages needing the API. 

All requests to the server component directly in the `/pages/SurveyForm/SurveyForm.jsx` and `pages/DocxEditor.js` files. 

The file `src/services/apiService.js` is included in the gitignore so when the `local_dev` branch is pulled into `main` the routing method is not overwritten. If new APIs are added, they will need to be manually pasted in. 

### When Running in a Terminal Window 
The configuration in the frontend files to communicate to the server and backend using the terminal is only setup in the `local_dev`and feature branches. This will not work in the `main` branch. 

Due to the defined paths in `./server/index.js`, when the server is run with the frontend in a terminal, all server requests made use `/api` as the API endpoint. 

The API endpoint for all backend requests use the port number that the backend FastAPI is running on, such as `localhost:8000` if running on port 8000. 

### When Running with Docker 
The configuration in the frontend files to communicate to the server and backend using the Docker is only setup in the `main` branch. This will not work in other branches. 

When hosting the AI Hub in the cloud, an nginx reverse proxy is required to securely manage communication between the frontend, server, and backend containers. In a Dockerized and cloud-hosted environment, each component runs as its own service on an internal network. Directly exposing these services would require multiple public ports and could unintentionally expose non-secure HTTP or WebSocket (WS) endpoints to users. 

To avoid this, the frontend container includes an nginx instance that serves as a single secure entry point for all browser traffic. The proxy accepts HTTPS and secure WebSocket (WSS) requests from the client (rather than HTTP and WS in the `local_dev` branch) and forwards them internally as HTTP and WS traffic to the appropriate service. This ensures secure external communication while keeping internal service traffic private. 

Due to the reverse proxy’s rerouting of request paths, any requests to the server need `/server` as the endpoint while the any to the backend uses `/api`. 

The [nginx-app.conf](../nginx-app.conf) file is used to build the reverse proxy used by the frontend. Some of the configurations in this file include the line `client_max_body_size 10M;` which limits the size of all file uploads on the AI Hub to 10 megabytes. 

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

## Language Toggling 
Due to the unreliability of automatic translation tools/libraries especially in a DFO context; a custom built in tool is used for toggling language between English and French. Each piece of English text needs to have a French translation (acquired manually) in a structured object in the `translations/` folder. Each page in the AI Hub then needs to use these defined objects in place of any text, so what is generated depends on the current language selected. 

When the language toggle button is used, the `contexts/LanguageContext.js` file is used by the toggle and all AI Hub pages to keep track of what the current language is. 

## Adding a New Tool/Page 
1. Go to the `pages/tools/` folder and create a new JS file for your tool. Add the logic this tools UI. 
2. For any calls/requests made to the backend call one of the functions defined in `services/apiService.js`. 
If you need to add a new API route for the backend: 
    1. Follow section 4.5 Adding a New API Route. 
    2. Create a new function in `services/apiService.js` that makes this new API request. 
3. Add in the language/translation logic: 
    1. Create a new JS file for your tool in the `translations/tools/` folder.  
    2. In this new file, export 2 dictionaries, one called `en` for all text used in the tool’s UI page and `fr` for all the translated text. Both dictionaries must share the same keys. 
    3. Add in the name of your tool in English and French in the list of tools found in `translations/layout.js` and `translations/components/aiToolsDropdown.js` files. 
    4. In the `utils/translations/toolTranslations.js` file, add a mapping for the new translation page for the tool. The name used should match the filename and will be key used in the UI tool page for accessing its English/French text. 
    5. In the new tool UI file, import `useLanguage` from the contexts folder and `getToolTranslations` from utils. You can then retreive the language dictionaries as so: 
``` javascript
const { language } = useLanguage(); 
const toolData = getToolTranslations("toolName", language);
```
4. Add tool to menu options so users can find it by following these steps: <br>
**This important and will be added in the future**.
 
## Current AI Hub Tools 
This section covers all of the tools currently deployed on the AI Hub. More technical details on how some of these tools are implemented in the backend are found in [BACKEND.md at Supported APIs](../backend/BACKEND.md#supported-apis). <br>
The source code for all the UI pages for all these tools are found in the `./src/pages/tools/` folder except for the AI Inventory Form located in `./src/pages/SurvayForm/` and the Statistical and ML Algorithms Guide UI found in `./src/pages/DocxEditor.js`. 

### Computer Vision 
#### Scale Ageing 
This tool uses a computer vision model trained on annotated salmon scale images to estimate fish age with high accuracy. It automates ageing for fisheries research and management. <br>

The tool originates from a pilot project to help reduce the manual workload currently born by subject matter experts (SMEs) for the DFO Science Branch's Sclerochronology Lab (Fish Ageing Lab). During this pilot, a YOLOv9 model was developed that achieved high accuracy in detecting scale features (clipping, center points, and fragments). The tool also provides transparent explanations by identifying and displaying winter ring patterns corresponding to age determination. <br>

The model itself is hosted on premise which is accessed via the backend component. 

#### Fence Counting 
This tool uses computer vision to analyze each frame of river monitoring videos, detecting and classifying salmon as they pass through counting fences. The AI model helps automate species identification and improve accuracy in population tracking. <br>

This tool originates from a pilot project to help DFO’s Science Branch’s Stock Assesment reduce time spent on manually review of underwater footage to count and identify migrating salmon and therefore minimize delays in data availability. <br>

During the pilot, a YOLOv11 detection model was successfully trained and integrated with BOT-SORT tracking algorithms to identify and count five salmon species: Pink, Chum, Chinook, Sockeye, and Coho. The model achieved 87% precision and 88% recall, demonstrating near-expert-level performance. When deployed, this system tracks individual fish throughout video segments and generates automated counts, eliminating the need for frame-by-frame manual review. <br>

Due to the file sizes of videos and the processing time of the footage, the AI Hub only has sample videos that have been processed with the YOLOv11 model in advance. 

#### Electronic Monitoring 
This tool is a proof-of-concept demo for DFO's Automated Electronic Monitoring. The project aims to modernize the currently labour-intensive process of manually reviewing video footage of selected sets of tows. The underlying fish counting model was developed in collaboration with the Pacific Groundfish EM Program and various industry partners. The model is capable of identifying and counting in real-time commonly harvested fish species in imagery collected from electronic monitoring equipment onboard commercial fishing vessels. 

The application is hosted on a different web application used by the OCDS team using Gradio. The version on the AI Hub is created by using an iframe rendering the Gradio page. As a result, it has its own English/French toggle that is independent of the AI Hub’s toggle. 

#### Underwater Marine Life Annotation 
Proof-of-concept demo for DFO Underwater Benthic Marine species identification. This project proposed by Quebec Region's science team aims to automate the review of underwater imagery and video footage collected for biodiversity surveys. The model developed is currently capable of identifying 21 benthic marine life categories drawn from underwater remotely operated vehicles. The project has also since garnered support from the science teams of other regions including Pacific Region. 

The application is hosted on a different web application used by the OCDS team using Gradio. The version on the AI Hub is created by using an iframe rendering the Gradio page. As a result, it has its own English/French toggle that is independent of the AI Hub’s toggle. 

#### Fish Population Estimation 
This tool is a proof-of-concept demo for an AI-based tool for DFO's underwater fish population estimation tasks. This project explores the potential of a tool that automates detection and estimation of the number of fish in underwater shoals and schools in imagery collected from camera equipment during underwater surveys. The model was developed as a by-product of the EM project, but it has since garnered interest from various programs like the Pacific Salmon Strategy Initiative where we are investigating the potential to leverage this model to automate salmon identification and counting. 

The application is hosted on a different web application used by the OCDS team using Gradio. The version on the AI Hub is created by using an iframe rendering the Gradio page. As a result, it has its own English/French toggle that is independent of the AI Hub’s toggle. 

#### Detection of Ghost Gear 
Proof-of-concept demo for DFO's Side-scan Sonar Image Ghost Gear Detector. This project was undertaken in partnership with the Ghost Gear Program and aims to automate the process of reviewing side-scan sonar imagery. The system developed leverages an AI-based computer vision model trained on data provided by CSR GeoSurveys Ltd. to identify in real-time Ghost Gear (Abandonned Lobster Traps) from collected side-scan sonar imagery. 

The application is hosted on a different web application used by the OCDS team using Gradio. The version on the AI Hub is created by using an iframe rendering the Gradio page. As a result, it has its own English/French toggle that is independent of the AI Hub’s toggle. 

#### CTD Data Quality Control 
Proof-of-concept demo for DFO Pacific Region CTD (Conductivity-Temperature-Depth) Data Quality Control model. CTD profiles are depth-wise series' of sensor measures for oceanographic data taken at fixed locations. Challenging ocean conditions and sensor faults can lead to poor quality data that must be manually identified and removed by oceanographers. This project was developed in collaboration with the Pacific Region Ocean Sciences Division and aims to accelerate the CTD quality control process by flagging bad data to assist oceanographers in more rapidly identifying and removing the bad data. Through experimental results, the model achieves 92.6% global accuracy in identifying bad data. The project has also since gained interest from the oceanography teams of other regions including Maritime Region. 

The application is hosted on a different web application used by the OCDS team using Gradio. The version on the AI Hub is created by using an iframe rendering the Gradio page. As a result, it has its own English/French toggle that is independent of the AI Hub’s toggle. 

#### Classification Model 
This tool sends your image to the already-built Azure Custom Vision models and returns a predicted label + confidence. All models are accessed via the backend component of the AI Hub. 

### Large Language Models 
#### CSV/PDF Analyzer 
This tool enables structured document analysis by processing CSV-based prompts against PDF files. Users can define specific questions or extraction tasks in a CSV file, and the tool will analyze the uploaded document accordingly. 

This tool originates from pilot projects aiming to use OCR and OpenAI to extract and summarize data from documents. A prebuilt OCR extraction model from Azure Document Intelligence is used to process the uploaded document, and then Azure OpenAI is used on the prompts defined in the CSV file to summarize relevant data with source references. Prompt engineering techniques (question formation and structuring) developed throughout the pilot are used on all prompts in the provided CSV file. 

#### PDF Chatbot 
This tool uses OpenAI's language model to answer questions about uploaded documents. It provides direct responses with sourced references, making document exploration faster and more efficient. 

Like the CSV/PDF Analyzer, this tool originates from pilot projects using OCR and OpenAI to extract and summarize data from documents; however, it does one prompt at a time and uses retrieval-augmented generation (RAG) using chromadb. RAG allows only relevant chunks of the uploaded document to be passed to OpenAI for a given prompt, reducing processing time and cost. 

#### PII Redactor 
This tool leverages [Microsoft Presidio](https://microsoft.github.io/presidio/) to detect and redact Personally Identifiable Information (PII) such as names, addresses, and phone numbers in PDF documents. It helps enhance data privacy by automatically censoring sensitive content. 

OCR is used to extract the text from the uploaded PDF and after Presidio is used, the uploaded PDF is modified with black boxes placed over all text determined to be sensitive content. This tool works well in some cases but needs to be future explored and developed to have useful applications in DFO. 

#### Sensitivity Score Calculator 
This tool uses [Microsoft Presidio](https://microsoft.github.io/presidio/) to analyze documents and determine their sensitivity score based on the presence of Personally Identifiable Information (PII). The higher the score, the more likely a document contains sensitive information. 

OCR is used to extract the text from the uploaded PDF and after Presidio is used, a score is calculated based on the type of sensitive data detected and the number of detections. This tool works well in some cases but needs to be future explored and developed to have useful applications in DFO. 

#### French Translation 
This tool uses Google's multilingual AI model ([MADLAD400 10B](https://huggingface.co/google/madlad400-10b-mt)) to translate PDF documents from English to French. It provides fast and efficient translations for various types of content while maintaining context and readability. 

This tool originates from a pilot project aimed to create a LLM that can translate English to French at the level of the French Translation Bureau. Training was done by collecting English-French text pairs from translated documents and fine-tuning an existing LLM with the training data. Although the pilot has been on hold due to lack of training documents and capacity, the latest iteration was proven to provide more accurate translations in a DFO context compared to other publicly available LLM tools. 

The AI model for this tool is hosted on premise and accessed via the backend. 

#### Web Scraper 
This tool allows users to input a website URL and automatically scrape its contents for structured data extraction. Once scraped, users can ask questions about the page using OpenAI-powered analysis. Ideal for quick insights, research, or prototyping, this scraper simplifies the process of turning raw web content into actionable answers. 

At a high level, the solution works in two ways: 
1. Scrape once, reuse many times <br>
A user pastes in a public website or intranet URL they care about. The tool automatically visits that site and its key subpages, scrapes the HTML content and reads commonly attached files and splits that content into smaller chunks. Each chunk is converted into an embedding and stored, along with its metadata, in a vector database. This makes the content searchable and reusable. Once a site has been processed, it appears as a “preset card” in the left-hand panel of the Web Scraper page, showing basic details like the site name and last scraped time. 

2. Chat instead of text-hunting <br>
Once a site has been scraped, anyone with access to the AI Portal can select its preset and start chatting with it. Users can ask questions, and the chatbot responds based only on the text that was collected from that site. Behind the scenes, the chatbot looks up the most relevant chunks from the vector database for that site and uses them to generate an answer based only on the prompt. The chat history and the scraped content for each site can be downloaded as simple text files, making it easy to keep a record of what was asked, answered, and scraped. 

From a user’s perspective, this turns a complex website into a single, interactive experience. Over time, a set of commonly used websites can be scraped once and reused by many scientists, analysts, and teams. 

For more detailed and technical documentation specifically on this tool, see the [WebScraper Chatbot Documentation](https://086gc.sharepoint.com/:w:/r/sites/PacificSalmonTeam/_layouts/15/Doc.aspx?sourcedoc=%7B43E161EB-4D11-4214-B6CD-E72F0272B56E%7D&file=WebScraper%20Chatbot%20Documentation.docx). 

### Optical Character Recognition 
#### Document OCR 
This tool allows users to upload a PDF and automatically scrape its contents for structured data extraction. Once scraped, users can ask questions about the PDF using OpenAI-powered analysis. Ideal for quick insights, research, or prototyping, this tool simplifies the process of turning raw PDF content into actionable answers. 

This tool uses Azure Document Intelligence and Azure OpenAI via the backend component. 

### Model Repo 
#### Models 
A unified repository where users can upload, explore, and manage machine learning models. It supports versioning and model cards with key metadata to help teams quickly integrate models into their workflows. Users can browse existing models from OCDS and SDPA or contribute their own. 

The solution introduces a model repository within the AI Hub, designed specifically to showcase the models that scientists have already built and trained. Rather than performing any machine learning tasks itself, the repository acts as a window into what already exists in Azure Machine Learning workspace which includes model versions, metadata, READMEs, tags, and artifacts stored within the MLflow registry server and Blob Storage.  

Users continue to upload, version, and manage their models entirely through the AML workspace, while the repository simply exposes this information through the AI Hub. The backends' endpoints communicate directly with AML to retrieve lists of models, fetch metadata, download artifacts, and extract READMEs. The frontend then presents this information in a consistent, searchable, and user-friendly catalogue. The result is a centralized hub that makes internal models easy to discover and reuse while keeping all model lifecycle operations inside AML. 

For more detailed and technical documentation specifically on this tool, see the [ML Model Repo Documentation](https://086gc.sharepoint.com/:w:/r/sites/PacificSalmonTeam/_layouts/15/Doc.aspx?sourcedoc=%7B9e61821f-450d-4817-b33c-f468ed18f0f1%7D). 

### AI Inventory Form 
#### Form 
This form is meant to be use as guide to support business users in articulating and imagining the potential of using Data, Artificial Intelligence, and Machine Learning to improve productivity, efficiencies, and generate value for program and service delivery, operations, and other business processes. It is meant to help users determine the value and potential of new data innovation from a value proposition, scalability, and sustainability lens rather than a technical implementation perspective. Complete responses will help Data and AI Scientist to determine how feasible a solution could be. 

Responses are handled by the server component which outputs into the Azure Storage Account connected to the AI Hub under the `ds_use_case_survey` folder. 

### Statistical and ML Algorithms Guide 
#### Document 
This document will describe different categories of machine learning algorithms and their intended purposes, specifically supervised learning followed by unsupervised learning. Individual algorithms will be explained, and a template will be provided for each algorithm that can be used out-of-box. 

This document is strictly scoped to the selection and training of ML models, which are a subset of tasks within the broader domains of ML Ops and AI Governance. There are many other tasks and responsibilities that constitute effective and responsible development, deployment and usage of ML models. The breadth of information needed to fully cover these domains requires a suite of policy, guidance, and educational materials. This document can be seen as one component of this broader suite that is currently being assembled within DFO. 

The library `@pdftron/webviewer` is used to generate the PDF view which allows users who are authenticated into the AI Hub to edit and annotate the document guide which is saved onto the file stored in Azure Blob Storage via the server component. 