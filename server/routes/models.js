const express = require('express');
const multer = require('multer');
const { getBlobServiceClient } = require('../services/azureBlobClient');

const router = express.Router();
const upload = multer();
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER_MODELS;

// helper: get the currently acting user
function getUserId(req) {
  // works whether or not express.json() ran, and whether body/query exist
  return req.get?.('x-user-id') || req.query?.userId || req.body?.userId || null;
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

async function listNames(container, prefix) {
  const out = [];
  for await (const b of container.listBlobsFlat({ prefix })) out.push(b.name);
  return out;
}
async function copyTree(container, fromPrefix, toPrefix) {
  const names = await listNames(container, fromPrefix);
  for (const src of names) {
    const buf = await container.getBlobClient(src).downloadToBuffer();
    const dst = src.replace(fromPrefix, toPrefix);
    await container.getBlockBlobClient(dst).uploadData(buf);
  }
}
async function deleteTree(container, prefix) {
  for await (const b of container.listBlobsFlat({ prefix })) {
    await container.deleteBlob(b.name).catch(() => {});
  }
}
async function upsertReadme(req, res) {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });

    const c = getBlobServiceClient().getContainerClient(CONTAINER);
    const pubBase  = `models/${id}`;
    const privBase = `users/${userId}/models/${id}`;

    // write into whichever base exists; default to private
    const targets = [];
    if (await c.getBlobClient(`${pubBase}/manifest.json`).exists())  targets.push(`${pubBase}/README.md`);
    if (await c.getBlobClient(`${privBase}/manifest.json`).exists()) targets.push(`${privBase}/README.md`);
    if (targets.length === 0) targets.push(`${privBase}/README.md`);

    const markdown = String(req.body?.markdown ?? '');
    const data = Buffer.from(markdown, 'utf8');

    for (const p of targets) {
      await c.getBlockBlobClient(p).uploadData(data, {
        blobHTTPHeaders: { blobContentType: 'text/markdown; charset=utf-8' }
      });
    }

    // bump updatedAt where applicable
    for (const m of [`${pubBase}/manifest.json`, `${privBase}/manifest.json`]) {
      const manBlob = c.getBlobClient(m);
      if (await manBlob.exists()) {
        const buf = await manBlob.downloadToBuffer();
        const man = JSON.parse(buf.toString('utf8'));
        man.updatedAt = new Date().toISOString();
        await c.getBlockBlobClient(m).uploadData(Buffer.from(JSON.stringify(man, null, 2)), {
          blobHTTPHeaders: { blobContentType: 'application/json' }
        });
      }
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('readme save error:', e);
    res.status(500).json({ error: 'readme save failed', details: e.message });
  }
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

    const tryPaths = [publicPath, privatePath].filter(Boolean);

    let json = null;
    for (const p of tryPaths) {
      const blob = client.getBlobClient(p);
      if (await blob.exists()) {
        const buf = await blob.downloadToBuffer();
        json = JSON.parse(buf.toString('utf8'));
        break;
      }
    }
    if (!json) return res.status(404).json({ error: 'not found', tried: tryPaths });
    res.json(json);
  } catch (e) {
    console.error('get model error:', e);
    res.status(500).json({ error: 'get failed', details: e.message });
  }
});



/* ---------------- Files Tab ---------------- */

/* ---------------- GET Files ---------------- */
router.get('/models/:id/files', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const client = getBlobServiceClient().getContainerClient(CONTAINER);
    
    // location of all files in a given model
    const publicPrefix  = `models/${id}/files/`;
    const privatePrefix = userId ? `users/${userId}/models/${id}/files/` : null;

    // Prefer private path when userId provided; fallback to public
    const prefixes = [privatePrefix, publicPrefix].filter(Boolean);

    let blobs = [];
    for (const prefix of prefixes) {
      const tmp = [];
      for await (const b of client.listBlobsFlat({ prefix })) {
        tmp.push({
          name: b.name,
          size: b.properties?.contentLength ?? 0,
          lastModified: b.properties?.lastModified ?? null,
          contentType: b.properties?.contentType ?? 'application/octet-stream',
        });
      }
      if (tmp.length) { blobs = tmp; break; } // first prefix with hits wins
    }

    res.json({ items: blobs });
  } catch (e) {
    console.error('get files error:', e);
    res.status(500).json({ error: 'get files failed', details: e.message });
  }
});

/* ---------------- APPEND files to an existing model ---------------- */
router.post('/models/append', upload.array('files'), async (req, res) => {
  try {
    const base = (req.body.base || '').toString().replace(/\/+$/, '');
    if (!base) return res.status(400).json({ error: 'base is required' });
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'no files' });

    const container = getBlobServiceClient().getContainerClient(CONTAINER);
    await container.createIfNotExists();

    for (const f of req.files) {
      const key = `${base}/files/${f.originalname}`;
      await container.getBlockBlobClient(key).uploadData(f.buffer, {
        blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
      });
    }
    res.json({ ok: true, count: req.files.length });
  } catch (e) {
    console.error('append error:', e);
    res.status(500).json({ error: 'append failed', details: e.message });
  }
});

module.exports = router;




/* ---------------- Settings Tab ---------------- */

// --- PATCH visibility: public <-> private ---
router.patch('/models/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const makePublic = String(req.body.visibility || '').toLowerCase() === 'public';
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });

    const container = getBlobServiceClient().getContainerClient(CONTAINER);
    const privBase = `users/${userId}/models/${id}`;
    const pubBase  = `models/${id}`;

    if (makePublic) {
      // move files to public, publish manifest, leave a pointer in "uploads"
      await copyTree(container, `${privBase}/files/`, `${pubBase}/files/`);
      await deleteTree(container, `${privBase}/files/`);

      const src = await readJson(container, `${privBase}/manifest.json`);
      const man = { ...src, private: false, sourcePath: pubBase, updatedAt: new Date().toISOString() };
      await container.getBlockBlobClient(`${pubBase}/manifest.json`)
        .uploadData(Buffer.from(JSON.stringify(man, null, 2)),
                    { blobHTTPHeaders: { blobContentType: 'application/json' } });

      const pointer = { ...man, sourcePath: pubBase }; // show in My Uploads
      await container.getBlockBlobClient(`${privBase}/manifest.json`)
        .uploadData(Buffer.from(JSON.stringify(pointer, null, 2)),
                    { blobHTTPHeaders: { blobContentType: 'application/json' } });

      return res.json(man);
    } else {
      // move files back to private and remove public copies
      await copyTree(container, `${pubBase}/files/`, `${privBase}/files/`);
      await deleteTree(container, `${pubBase}/`);

      const src = await readJson(container, `${privBase}/manifest.json`)
                 || await readJson(container, `${pubBase}/manifest.json`) || {};
      const man = { ...src, private: true, sourcePath: privBase, updatedAt: new Date().toISOString() };
      await container.getBlockBlobClient(`${privBase}/manifest.json`)
        .uploadData(Buffer.from(JSON.stringify(man, null, 2)),
                    { blobHTTPHeaders: { blobContentType: 'application/json' } });

      return res.json(man);
    }
  } catch (e) {
    console.error('visibility patch error:', e);
    res.status(500).json({ error: 'visibility update failed', details: e.message });
  }
});

// --- PATCH metadata: name/owner/description/tags (no path move) ---
router.patch('/models/:id/meta', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const c = getBlobServiceClient().getContainerClient(CONTAINER);

    const pub = `models/${id}/manifest.json`;
    const prv = userId ? `users/${userId}/models/${id}/manifest.json` : null;

    let man = (await readJson(c, pub)) || (prv && await readJson(c, prv));
    if (!man) return res.status(404).json({ error: 'not found' });

    const patch = {};
    ['name', 'owner', 'description', 'tags'].forEach(k => {
      if (k in req.body) patch[k] = req.body[k];
    });
    man = { ...man, ...patch, updatedAt: new Date().toISOString() };

    const targets = [];
    if (await c.getBlobClient(pub).exists()) targets.push(pub);
    if (prv && await c.getBlobClient(prv).exists()) targets.push(prv);

    for (const p of targets) {
      await c.getBlockBlobClient(p).uploadData(
        Buffer.from(JSON.stringify(man, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );
    }
    res.json(man);
  } catch (e) {
    console.error('meta patch error:', e);
    res.status(500).json({ error: 'meta update failed', details: e.message });
  }
});

// --- DELETE repository (public + private trees) ---
router.delete('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const c = getBlobServiceClient().getContainerClient(CONTAINER);

    await deleteTree(c, `models/${id}/`);
    if (userId) await deleteTree(c, `users/${userId}/models/${id}/`);

    res.json({ ok: true });
  } catch (e) {
    console.error('delete error:', e);
    res.status(500).json({ error: 'delete failed', details: e.message });
  }
});



/* ---------------- Overview Tab ---------------- */
// --- Get README.md (public first, then private)
router.get('/models/:id/readme', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const c = getBlobServiceClient().getContainerClient(CONTAINER);

    // Prefer private if caller is the owner; fall back to public
    const tryPaths = [
      userId ? `users/${userId}/models/${id}/README.md` : null,
      `models/${id}/README.md`,
    ].filter(Boolean);

    for (const p of tryPaths) {
      const blob = c.getBlobClient(p);
      if (await blob.exists()) {
        const buf = await blob.downloadToBuffer();
        return res.type('text/markdown; charset=utf-8').send(buf.toString('utf8'));
      }
    }
    return res.type('text/markdown; charset=utf-8').send(''); // 200, no README yet
  } catch (e) {
    console.error('readme get error:', e);
    res.status(500).json({ error: 'readme get failed', details: e.message });
  }
});

// accept BOTH methods so client and server won’t drift
router.put('/models/:id/readme', upsertReadme);
router.post('/models/:id/readme', upsertReadme);