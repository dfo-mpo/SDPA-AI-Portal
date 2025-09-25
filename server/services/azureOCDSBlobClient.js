const { BlobServiceClient } = require('@azure/storage-blob');

function getOCDSBlobServiceClient() {
  const { AZURE_OCDS_STORAGE_ACCOUNT_NAME, AZURE_OCDS_STORAGE_ACCOUNT_KEY } = process.env;

  if (!AZURE_OCDS_STORAGE_ACCOUNT_NAME || !AZURE_OCDS_STORAGE_ACCOUNT_KEY) {
    throw new Error('Missing Azure Storage environment variables');
  }

  const AZURE_STORAGE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${AZURE_OCDS_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_OCDS_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;

  return BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
}

module.exports = { getOCDSBlobServiceClient };