const express = require('express');
const { getBlobServiceClient } = require('../services/azureBlobClient');

const router = express.Router();

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

router.get('/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params;

  try {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(`${folder}/${filename}`);
    const downloadBlockBlobResponse = await blobClient.download();

    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', downloadBlockBlobResponse.contentType || 'application/octet-stream');

    downloadBlockBlobResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Error loading file from Azure Blob:', err.message);
    res.status(500).json({ error: 'Failed to retrieve document.' });
  }
});

module.exports = router;
