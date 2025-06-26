const express = require('express');
const multer = require('multer');
const { getBlobServiceClient } = require('../services/azureBlobClient');

const router = express.Router();
const upload = multer();
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

router.post('/saveEdits', upload.single('file'), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const folder = req.body.folder;
    
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(`${folder}/${originalname}`);
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    });

    res.status(200).json({ message: 'Upload successful' });
  } catch (err) {
    console.error('Error saving document to blob:', err.message);
    res.status(500).json({ error: 'Failed to save document.' });
  }
});

router.get('/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;

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
