const { BlobServiceClient } = require('@azure/storage-blob');

function getBlobServiceClient() {
  const { AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY } = process.env;

  if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY) {
    throw new Error('Missing Azure Storage environment variables');
  }

  const AZURE_STORAGE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;

  return BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
}

module.exports = { getBlobServiceClient };
