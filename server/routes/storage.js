const express = require('express');
const { getBlobServiceClient } = require('../services/azureBlobClient');
const { parse } = require('json2csv');

const router = express.Router();

const folderName = 'ds_use_case_survey';
const fileName = 'responses.csv';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

router.post('/storeResponse', async (req, res) => {
  try {
    const { answers } = req.body;
    const timestamp = new Date().toISOString();
    const containerClient = getBlobServiceClient().getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(`${folderName}/${fileName}`);

    const questionKeys = Object.keys(answers);

    let existingCSV = '';
    let responseId = 0;

    try {
      // Try to read existing CSV
      const downloadBuffer = await blobClient.downloadToBuffer();
      existingCSV = downloadBuffer.toString();

      const rows = existingCSV.split('\n').filter(row => row.trim() !== '');
      responseId = rows.length > 1 ? rows.length - 1 : 0;
    } catch (err) {
      // If blob doesn't exist yet, initialize with headers
      existingCSV = `response_id,timestamp,${questionKeys.join(',')}\n`;
    }

    const newEntry = [{ response_id: responseId, timestamp, ...answers }];
    const newCSV = parse(newEntry, { header: false });

    const finalCSV = existingCSV + newCSV + '\n';

    await blobClient.upload(finalCSV, Buffer.byteLength(finalCSV), {
      blobHTTPHeaders: { blobContentType: 'text/csv' },
    });

    res.status(200).json({ message: 'Response stored successfully' });
  } catch (error) {
    console.error('Error storing response:', error.message);
    res.status(500).json({ error: 'Failed to store response' });
  }
});

router.get('/test', async (req, res) => {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();

    if (exists) {
      res.status(200).json({ message: `Connection to Azure container "${containerName}" successful.` });
    } else {
      res.status(404).json({ error: `Container "${containerName}" not found.` });
    }
  } catch (error) {
    console.error('Connection test failed:', error.message);
    res.status(500).json({ error: 'Azure Blob connection failed.' });
  }
});

module.exports = router;
