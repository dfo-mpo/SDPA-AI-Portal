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

// sanitize rel path
function cleanRelPath(p) {
  const s = String(p || "").replace(/\\/g, "/");
  if (!s || s.startsWith("/") || s.includes("..")) return null;
  return s.split("/").filter(Boolean).join("/");
}

async function readJson(containerClient, blobName) {
  const blob = containerClient.getBlobClient(blobName);
  if (!(await blob.exists())) return null;
  const buf = await blob.downloadToBuffer();
  return JSON.parse(buf.toString('utf8'));
}

// Ensure prefix always ends with a single slash
function normPrefix(p = "") {
  return String(p).replace(/\\/g, "/").replace(/\/+$/,"") + "/";
}

// Overwrite old copyTree with a robust, prefix-safe version
async function copyTree(container, fromPrefixRaw, toPrefixRaw) {
  const fromPrefix = normPrefix(fromPrefixRaw);
  const toPrefix   = normPrefix(toPrefixRaw);

  let copied = 0;
  const failed = [];

  for await (const b of container.listBlobsFlat({ prefix: fromPrefix })) {
    const src = b.name;
    if (!src) continue;

    // skip any “folder marker” blobs (like Notes with no extension)
    const relative = src.substring(fromPrefix.length);
    if (!relative || relative.endsWith("/")) continue; // definitely a folder
    if (!relative.includes(".")) continue; // no file extension = probably a fake folder marker

    // Destination = keep path after /files/
    const splitIdx = src.indexOf("/files/");
    if (splitIdx === -1) continue;
    const relPath = src.substring(splitIdx + "/files/".length);
    const dst = `${toPrefix}${relPath}`;

    try {
      const buf = await container.getBlobClient(src).downloadToBuffer();
      await container.getBlockBlobClient(dst).uploadData(buf, {
        blobHTTPHeaders: {
          blobContentType: b.properties?.contentType || "application/octet-stream",
        },
      });
      copied++;
    } catch (err) {
      console.error("copyTree failed", { src, dst, err: err.message });
      failed.push({ src, dst, error: err.message });
    }
  }

  return { copied, failed };
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

async function blobExists(container, key) {
  return container.getBlobClient(key).exists();
}
async function copyBlob(container, fromKey, toKey, contentType = 'application/octet-stream') {
  const buf = await container.getBlobClient(fromKey).downloadToBuffer();
  await container.getBlockBlobClient(toKey).uploadData(buf, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
}

// helper: stream → buffer
async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
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
    const makePublic = visibility === 'public';
    const version = "v1"; // always start at v1
    const basePublic  = `models/${id}`;
    const basePrivate = `users/${userId}/models/${id}`;

    const svc = getBlobServiceClient();
    const container = svc.getContainerClient(CONTAINER);
    await container.createIfNotExists();

    // manifest (private copy is always canonical)
    const rootManifest = {
      id,
      name: title || id,
      owner,
      description,
      tags,
      private: !makePublic,         // private flag reflects visibility
      versions: [version],
      latestVersion: version,
      updatedAt: new Date().toISOString(),
      downloads: 0,
      sourcePath: basePrivate       // sourcePath always points to private
    };

    // Version manifest
    const versionManifest = {
      ...rootManifest,
      version,
    };

    // --- Write private manifest.json
    await container.getBlockBlobClient(`${basePrivate}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(rootManifest, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    // Save version manifest
    await container.getBlockBlobClient(`${basePrivate}/versions/${version}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(versionManifest, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    // --- Write any attached files under private/files/
    let rels = req.body.paths || req.body['paths[]'];
    if (!Array.isArray(rels)) rels = typeof rels === 'string' ? [rels] : [];

    for (let i = 0; i < (req.files || []).length; i++) {
      const f = req.files[i];
      const rel = cleanRelPath(rels[i] || f.originalname);
      if (!rel) continue;
      const target = `${basePrivate}/versions/${version}/files/${rel}`;
      await container.getBlockBlobClient(target).uploadData(f.buffer, {
        blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
      });
    }

    // --- If PUBLIC, also create a mirrored public manifest and copy files
    if (makePublic) {
      // mirror manifest
      const pubMan = { ...rootManifest, private: false, sourcePath: basePublic };
      await container.getBlockBlobClient(`${basePublic}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubMan, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );

      const pubVer  = { ...versionManifest, private: false, sourcePath: basePublic };
      await container.getBlockBlobClient(`${basePublic}/versions/${version}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubVer, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );

      // mirror README if private one exists
      const privReadme = container.getBlobClient(`${basePrivate}/README.md`);
      if (await privReadme.exists()) {
        const buf = await privReadme.downloadToBuffer();
        await container.getBlockBlobClient(`${basePublic}/README.md`).uploadData(buf, {
          blobHTTPHeaders: { blobContentType: 'text/markdown; charset=utf-8' }
        });
      }

      // mirror all uploaded files
      for (let i = 0; i < (req.files || []).length; i++) {
        const f = req.files[i];
        const rel = cleanRelPath(rels[i] || f.originalname);
        if (!rel) continue;
        const target = `${basePublic}/versions/${version}/files/${rel}`;
        await container.getBlockBlobClient(target).uploadData(f.buffer, {
          blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
        });
      }
    }

    res.json({
      ok: true,
      privateBase: basePrivate,
      publicBase: makePublic ? basePublic : null,
      manifest: rootManifest,
      fileCount: (req.files || []).length
    });
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
      // only manifests
      if (!b.name.endsWith('manifest.json')) continue;

      try {
        const blob = client.getBlobClient(b.name);
        // only grab the first 4KB (enough for your JSON)
        const resp = await blob.download(0, 4096);
        const buf = await streamToBuffer(resp.readableStreamBody);
        const json = JSON.parse(buf.toString('utf8'));
        items.push(json);
      } catch (e) {
        console.warn('bad manifest', b.name, e.message);
      }
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
      if (!b.name.endsWith('manifest.json')) continue;
      
      try {
        const blob = client.getBlobClient(b.name);
        const resp = await blob.download(0, 4096);
        const buf = await streamToBuffer(resp.readableStreamBody);
        const json = JSON.parse(buf.toString('utf8'));
        items.push(json);
      } catch (e) {
        console.warn('bad manifest', b.name, e.message);
      }
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

    const publicPath  = `models/${id}/manifest.json`;
    const privatePath = userId ? `users/${userId}/models/${id}/manifest.json` : null;

    // ✅ Always prefer public first, fallback to private
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

    if (!json) {
      return res.status(404).json({ error: 'not found', tried: tryPaths });
    }

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

    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });

    const parts = base.split('/');
    const id = parts[parts.length - 1];
    const privBase = `users/${userId}/models/${id}`;
    const pubBase  = `models/${id}`;
    const isPublic = base.startsWith('models/');

    const container = getBlobServiceClient().getContainerClient(CONTAINER);
    await container.createIfNotExists();

    let dir = (req.body.dir || '').toString().trim();
    dir = dir.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.+/g, '').replace(/\/+/g, '/');
    if (dir && !dir.endsWith('/')) dir += '/';

    // normalize paths array
    let rels = req.body.paths || req.body['paths[]'];
    if (!Array.isArray(rels)) rels = rels ? [rels] : [];

    const uploaded = [];

    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const rel = cleanRelPath(rels[i] || f.originalname || f.fieldname);
        if (!rel) continue;

        const relPath = dir + rel;

        const targets = isPublic
          ? [ `${privBase}/files/${relPath}`, `${pubBase}/files/${relPath}` ]
          : [ `${privBase}/files/${relPath}` ];

        for (const key of targets) {
          await container.getBlockBlobClient(key).uploadData(f.buffer, {
            blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
          });
          uploaded.push(key);
        }
      }
    }


    res.json({ ok: true, count: uploaded.length, uploaded });
  } catch (e) {
    console.error('append error:', e?.message || e);
    res.status(500).json({ error: 'append failed', details: e?.message || String(e) });
  }
});

/* ---------------- DELETE files from an existing model ---------------- */
router.delete('/models/file', async (req, res) => {
  try {
    const { base, filePath, userId } = req.body;
    if (!base || !filePath) {
      return res.status(400).json({ error: 'base and filePath required' });
    }

    const container = getBlobServiceClient().getContainerClient(CONTAINER);

    // figure out id from base
    const parts = base.split('/');
    const id = parts[parts.length - 1]; // last segment is model id

    const privBase = userId ? `users/${userId}/models/${id}` : null;
    const pubBase  = `models/${id}`;

    const targets = [];

    if (base.startsWith('models/')) {
      // public delete → do both
      targets.push(`${pubBase}/files/${filePath}`);
      if (privBase) targets.push(`${privBase}/files/${filePath}`);
    } else {
      // private delete → just private
      targets.push(`${privBase}/files/${filePath}`);
    }

    const deleted = [];
    for (const key of targets) {
      try {
        await container.deleteBlob(key);
        deleted.push(key);
      } catch (err) {
        // swallow "not found" errors
        console.warn(`delete failed for ${key}:`, err.message);
      }
    }

    res.json({ ok: true, deleted });
  } catch (e) {
    console.error('delete error:', e);
    res.status(500).json({ error: 'delete failed', details: e.message });
  }
});



/* ---------------- Settings Tab ---------------- */

// --- PATCH visibility: public <-> private ---
router.patch('/models/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const makePublic = String(req.body.visibility || '').toLowerCase() === 'public';
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });

    const container = getBlobServiceClient().getContainerClient(CONTAINER);
    await container.createIfNotExists();

    const privBase = `users/${userId}/models/${id}`;
    const pubBase  = `models/${id}`;

    if (makePublic) {
      // Mirror private -> public
      const filesCopy = await copyTree(container, `${privBase}/files/`, `${pubBase}/files/`);

      // README mirror if present in private
      if (await blobExists(container, `${privBase}/README.md`)) {
        await copyBlob(container, `${privBase}/README.md`, `${pubBase}/README.md`, "text/markdown; charset=utf-8");
      }

      // Build public manifest (private stays untouched as canonical)
      const privMan = await readJson(container, `${privBase}/manifest.json`) || {};
      const pubMan  = { ...privMan, private: false, sourcePath: pubBase, updatedAt: new Date().toISOString() };

      await container.getBlockBlobClient(`${pubBase}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubMan, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );

      return res.json({ ...pubMan, copyReport: filesCopy });
    }

    // Public -> Private: remove the public mirror only
    await deleteTree(container, `${pubBase}/`);

    // Make sure private manifest flags are correct
    const privMan0 = await readJson(container, `${privBase}/manifest.json`) || {};
    const privMan  = { ...privMan0, private: true, sourcePath: privBase, updatedAt: new Date().toISOString() };

    await container.getBlockBlobClient(`${privBase}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(privMan, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    return res.json(privMan);
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
module.exports = router;