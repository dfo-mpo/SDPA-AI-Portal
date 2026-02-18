const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

function getBlobServiceClient() {
  const { AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, KEY_VAULT_NAME } = process.env;

  if (!AZURE_STORAGE_ACCOUNT_NAME || (!AZURE_STORAGE_ACCOUNT_KEY && !KEY_VAULT_NAME)) {
    throw new Error('Missing Azure Storage environment variables');
  }
  
  let accountKey = AZURE_STORAGE_ACCOUNT_KEY;
  if (KEY_VAULT_NAME) {
    const kvUri = `https://${KEY_VAULT_NAME}.vault.azure.net`;
    const credential = new DefaultAzureCredential();  
    const client = new SecretClient(kvUri, credential);
    accountKey = client.getSecret("azure-storage-key");
  }

  const AZURE_STORAGE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

  return BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
}

module.exports = { getBlobServiceClient };
