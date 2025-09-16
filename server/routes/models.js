const express = require('express');
const multer = require('multer');
const { getBlobServiceClient } = require('../services/azureBlobClient');

const router = express.Router();
const upload = multer();
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER_MODELS;

// helper: get the currently acting user
function getUserId(req) {
  return (
    req.header('x-user-id') || // preferred: from auth middleware
    req.query.userId ||
    req.body.userId ||
    null
  );
}

// tiny slugifier to avoid extra deps
function toSlug(s = '') {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')   // non-alnum -> hyphen
    .replace(/^-+|-+$/g, '')       // trim hyphens
    || 'model';
}

async function readJson(containerClient, blobName) {
  const blob = containerClient.getBlobClient(blobName);
  if (!(await blob.exists())) return null;
  const buf = await blob.downloadToBuffer();
  return JSON.parse(buf.toString('utf8'));
}

// ---------- CREATE MODEL ----------
router.post('/models/create', upload.array('files'), async (req, res) => {
  try {
    const owner      = req.body.owner || '';
    const title      = req.body.title || '';
    const description = (req.body.description || '').trim();
    const visibility = (req.body.visibility || 'private').toLowerCase();
    const userId     = getUserId(req); 

    if (!userId || userId === "me"){
        return res.status(401).json({ error: 'Sign-in required to create a model.' });
    }

    if (!description){
        return res.status(400).json({ error: 'Description is required.' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one file is required.' });
    }

    // tags can be comma-separated string or multiple fields
    let tags = req.body.tags;
    if (typeof tags === 'string') tags = tags.split(',').map(s => s.trim()).filter(Boolean);
    if (!Array.isArray(tags)) tags = [];

    const id = toSlug(title) || toSlug(owner);
    const isPrivate = visibility !== 'public';
    const basePublic = `models/${id}`;
    const basePrivate = `users/${userId}/models/${id}`;
    const base = isPrivate ? basePrivate : basePublic;

    const svc = getBlobServiceClient();
    const container = svc.getContainerClient(CONTAINER);
    await container.createIfNotExists();

    const manifest = {
      id,
      name: title || id,
      owner,
      description,
      tags,
      private: isPrivate,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      downloads: 0,
      sourcePath: base
    };

    // write manifest.json
    await container.getBlockBlobClient(`${base}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(manifest, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    // write any attached files under files/
    for (const f of req.files || []) {
      const target = `${base}/files/${f.originalname}`;
      await container.getBlockBlobClient(target).uploadData(f.buffer, {
        blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
      });
    }

    // If PUBLIC, also add a pointer manifest under the user's uploads so it appears in "My Uploads"
    if (!isPrivate) {
        const pointer = {
            ...manifest,
            private: false,
            // point to the public location explicitly
            sourcePath: basePublic
        };
        await container.getBlockBlobClient(`${basePrivate}/manifest.json`).uploadData(
            Buffer.from(JSON.stringify(pointer, null, 2)),
            { blobHTTPHeaders: { blobContentType: 'application/json' } }
        );
    }
    res.json({ ok: true, base, manifest, fileCount: (req.files || []).length });
  } catch (e) {
    console.error('models/create error:', e);
    res.status(500).json({ error: 'create failed', details: e.message });
  }
});

// ---------- LIST PUBLIC MODELS ----------
router.get('/models', async (_req, res) => {
  try {
    const client = getBlobServiceClient().getContainerClient(CONTAINER);
    const items = [];
    for await (const b of client.listBlobsFlat({ prefix: 'models/' })) {
      if (!b.name.endsWith('/manifest.json')) continue;
      const json = await readJson(client, b.name).catch(() => null);
      if (json) items.push(json);
    }
    res.json({ items });
  } catch (e) {
    console.error('models list error:', e);
    res.status(500).json({ error: 'list failed', details: e.message });
  }
});

/* ---------------- LIST MY UPLOADS ---------------- */
router.get('/uploads', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });
    const prefix = `users/${userId}/models/`;
    const client = getBlobServiceClient().getContainerClient(CONTAINER);

    const items = [];
    for await (const b of client.listBlobsFlat({ prefix })) {
      if (!b.name.endsWith('/manifest.json')) continue;
      const json = await readJson(client, b.name).catch(() => null);
      if (json) items.push(json);
    }
    res.json({ items });
  } catch (e) {
    console.error('uploads list error:', e);
    res.status(500).json({ error: 'uploads list failed', details: e.message });
  }
});

/* ---------------- GET MODEL (public or my upload) ---------------- */
router.get('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const client = getBlobServiceClient().getContainerClient(CONTAINER);

    const publicPath = `models/${id}/manifest.json`;
    const privatePath = `users/${userId}/models/${id}/manifest.json`;

    let json = await readJson(client, publicPath);
    if (!json) json = await readJson(client, privatePath);
    if (!json && userId) {
        const privatePath = `users/${userId}/models/${id}/manifest.json`;
        json = await readJson(client, privatePath);
    }

    res.json(json);
  } catch (e) {
    console.error('get model error:', e);
    res.status(500).json({ error: 'get failed', details: e.message });
  }
});

module.exports = router;