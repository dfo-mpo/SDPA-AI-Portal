# Contributing
Before doing any work on the AI Hub make sure to read through the documentation for each component to understand how everything works.

To understand how the interface, communication between docker images, and authentication are implemented see [FRONTEND](src/FRONTEND.md).

To understand how Azure Blob Storage is used by the AI Hub, see [SERVER](server/SERVER.md).

To understand how AI/ML models and tools are implemented, see [BACKEND](backend/BACKEND.md).

**Recommened Branch Workflow for adding new feature:** Create a new branch for your feature based off the `local_dev` branch. Once the feature is working, merge the feature branch with `local_dev`, then pull `local_dev` into `main`. You can verify everything works with docker before updating any cloud deployment.<br>
How to run the AI Hub without docker can be found in the `local_dev` [README](https://github.com/dfo-mpo/SDPA-AI-Portal/blob/local_dev/README.md) file.

## Deploying the Docker Container on Azure Webapps
The AI Hub is deployed on Azure Web Apps with the dockerized images hosted on an Azure Container Registry resource. Azure Key Vault is also used for storing keys instead of using enviroment variables. <br>
This section will help you update the current Azure Hub instance with a new release but also provide additional context to allow replication in a new Azure enviroment.<br>
If you are using the existing deployment in Azure, you can jump to [docker requirments](CONTRIBUTE.md#install-docker-desktop-if-you-dont-already-have-it-on-your-device).

### Prerequisites
#### Setup Web App Resource
1. Create an Azure Web App resource. Make sure that the option for Publish is set to *Container*.
2. Once the resource is created, open it and go into the `Configuration` page under settings and apply the following changes the click on save:
    * Set SCM Basic Auth Publishing Credentials to `On`
    * Set FTP Basic Auth Publishing Credentials to `On`
    * Set HTTPS Only to `Off` (Only if any of your code makes external HTTP requests, the AI portal backend does to a VM with high GPU, make sure to understand the risks of non secure requests)
    * Set Always on to `On` (Recomended)
    * Ensure HTTP version is set to `1.1`, the proxy in frontend dockerfile is set up to use 1.1
3. Now go to the `Identity` page under the *System assigned* tab, set Status to 'On', press save, and copy the Object ID that is generated.
#### Setup Container Registry Resource
4. Create an Azure Container Registry, using defualt configurations.
5. Once the resouce is created, open it and go to the *Access control (IAM)* page. Then create a new role assignment for the Web App resource:
    * Click on the '+ Add' option to go to the role creation page. 
    * Under 'Role' select *AcrPull* then click next.
    * Under 'Memebers click on *Select members* and under the Object ID copied from step 3 into the search bar. Select the web app resource that appears. Click Next and finish the creation of the role assignment.
6. Now go to the *Properties* page and make sure the Admin user option is selected.
#### Setup Service Principle (if using Authentication)
7. You will need to create an App Registration for the Azure Web App used and the users that will have the ability to authenticate when logging in. You will likely need to reach out to IT for creating this, see [this documentation](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) for more details.
8. Get the application ID of the App Registration and the application ID of the service principle tied to the web application. They will be needed later.

#### Setup Azure Key Vault
9. Create an Azure Key Vault resource using default configurations.
10. Go to the resource once it is created and open the `Access Control (IAM)` page
11. Create a new role granting at least `Get` and `List` for secrets for the Object ID for the Azure Web App **AND** the application ID from the service principle tied to the Azure Web App.
12. Go to the `Secrets` page and create secrets for each key as identified in the [backend](backend/ai_ml_tools/utils/azure_key_vault.py) and [server](server/services/azureBlobClient.js).
13. Go back to the Azure Web App resource created earlier.
14. Go to the `Environment variables` page. Click on *Add* to create a new enviroment variable: 
    * Set the *Name* to `KEY_VAULT_NAME`
    * Set the *Value* to the name of your Azure Key Vault resource.
    * Click *Apply* to add the variable, then click *Apply* again to save the change.
#### Install Docker Desktop (If you don't already have it on your device)
15. First you need to install the Linux subsystem for Windows, open a PowerShell or Command Prompt terminal using Admin Privileges and run the following command: 
```bash
wsl --install 
```
You may need to restart the computer after this step.

16. Download and install Docker Desktop from the Docker Website [Docker Downloads](https://docs.docker.com/desktop/setup/install/windows-install/). 

When prompted, ensure the Use WSL 2 instead of Hyper-V option on the Configuration page is selected 
#### Setup Terminal Connection
17. Download and install Azure CLI from Microsoft:
[Azure CLI Downloads](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows?pivots=msi). Note that you may need admin privileges to run the msi file.
18. Open a terminal on your PC and log into the azure subscription you wish to use:
```bash
az login
```
You will be shown all available subscriptions, select the one with your Azure Container registry. <br>
If the subscription you are looking for is in a tenant that does not appear, then you will need to login to that specific tenant: 
```bash
az login --tenant <tenantID>
```
Note SSC 163Oxygen tenantID is 8c1a4d93-d828-4d0e-9303-fd3bd611c822. You can find it as Directory ID when viewing directories in Azure. 

19. Log into your Azure Container Registry resource using the following command:
```bash
az acr login --name <acr_resource_name>
```
Where acr_resource is the name of the resource you want to push your docker images too.

### Create Deployment on Web App
1. In the `./backend/ai_ml_tools` folder, copy and rename the '.env.sample' file to '.env'. 
    * (Optional, only for testing) Fill in the keys for OpenAI, Document Intelligence, and other APIs used.
2. In the `./server/` folder, copy and rename the '.env.sample' file to 'env'. 
    * Fill in the details for an Azure storage account to connect too (only include key for testing).
3. In the `./src/components/auth/` folder, copy and rename the 'authConfig.example.js' into 'authConfig.js'. Make sure to add in the values for clientId, authority, redirectURI, and postLogoutRedirectUri.
4. Build the local docker container using the command:
```bash
# Use this command if your docker engine version is below 20.10
docker-compose up --build

# Use this command if you have docker engine v20.10 or newer
docker compose up --build
```
5. Verify that everything is working as expected on http://localhost:3080.
6. **IMPORTANT** If you included keys in steps `1` and `2`, **REMOVE THESE KEYS BEFORE PROCEEDING**.
    * After **removing** keys from the `.env` files, **rerun** the docker compose command in step `4` to build the image without any keys.
7. Once you have built your local docker container you need to tag the images that have modifications.<br>
<b>Important:</b> If you tag and push a version (eg. v1, v2, ...) that already exists in the ACR resource, it will overwrite it.<br>
```bash
docker tag <project-foldername-lowercase>-backend <acr_resource_name>.azurecr.io/ai-ml-tools-backend:v1
docker tag <project-foldername-lowercase>-frontend <acr_resource_name>.azurecr.io/ai-ml-tools-frontend:v1
docker tag <project-foldername-lowercase>-server <acr_resource_name>.azurecr.io/ai-ml-tools-server:v1
```
8. Push your local images with changes to the ACR:
```bash
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-backend:v1
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-frontend:v1
docker push <acr_resource_name>.azurecr.io/ai-ml-tools-server:v1
```
9. Go to your Azure Web App resource to the *Deployment Center* page then set up the container:
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