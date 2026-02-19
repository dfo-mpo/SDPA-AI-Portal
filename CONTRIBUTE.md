## IMPORTANT: Required Routing Paths for Server/Backend Communication
To simplify communication between the images/containers, a reverse nginx proxy is setup to reroute all requests from the frontend to the server or backend images. The nginx-app.conf file contains all reverse proxy logic.

Any file that communicates to the backend or server using an HTTP request to 'localhost' will need to have it's path updated to be '/api' for backend requests or '/server' for server requests.

<b>Important:</b> src/services/apiService.js is in the gitignore, if you are pulling from a different branch, changes to this file need to be manually pasted in. This is because the routing between the docker images differs due to a proxy.

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