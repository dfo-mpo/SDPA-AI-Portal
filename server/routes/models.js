const express = require('express');
const multer = require('multer');
const { getOCDSBlobServiceClient } = require('../services/azureOCDSBlobClient');

const router = express.Router();
const upload = multer();
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER_MODELS;

/* ---------------- helpers ---------------- */
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

// Copy every real blob under fromPrefix into toPrefix (preserve relative paths), recursively.
async function copyTree(container, fromPrefixRaw, toPrefixRaw) {
  const fromPrefix = normPrefix(fromPrefixRaw);
  const toPrefix   = normPrefix(toPrefixRaw);
  const JUNK = new Set(['.keep', '.DS_Store', 'Thumbs.db']);

  let copied = 0;
  const failed = [];

  async function walk(prefix) {
    // page through current level
    const pages = container.listBlobsByHierarchy('/', { prefix }).byPage({ maxPageSize: 5000 });
    for await (const page of pages) {
      const items = page.segment?.blobItems || [];
      const dirs  = page.segment?.blobPrefixes || [];

      // copy files at this level
      for (const b of items) {
        const src = b.name;                           // full path
        if (!src.startsWith(fromPrefix)) continue;

        const relPath = src.substring(fromPrefix.length);
        if (!relPath) continue;

        const leaf = relPath.split('/').pop();
        if (!leaf) continue;
        if (leaf.startsWith('~$')) continue;          // Office temp files
        if (JUNK.has(leaf)) continue;

        const dst = `${toPrefix}${relPath}`;

        try {
          const srcClient = container.getBlobClient(src);
          const [buf, props] = await Promise.all([
            srcClient.downloadToBuffer(),
            srcClient.getProperties().catch(() => ({})),
          ]);

          await container.getBlockBlobClient(dst).uploadData(buf, {
            blobHTTPHeaders: {
              blobContentType: props.contentType || "application/octet-stream",
            },
          });
          copied++;
        } catch (err) {
          console.error("copyTree failed", { src, dst, err: err.message });
          failed.push({ src, dst, error: err.message });
        }
      }

      // recurse into subfolders
      for (const d of dirs) {
        await walk(d.name);
      }
    }
  }

  await walk(fromPrefix);
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

    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);
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

async function listTopLevelIds(container, base /* e.g. 'models/' or `users/${uid}/models/` */) {
  const ids = [];
  const root = base.replace(/\/+$/, '') + '/';
  const delim = '/';

  const pager = container.listBlobsByHierarchy(delim, { prefix: root }).byPage({ maxPageSize: 5000 });
  for await (const page of pager) {
    const dirs = page.segment?.blobPrefixes || [];
    for (const d of dirs) {
      // d.name like 'models/my-model/'
      const id = d.name.slice(root.length).split('/')[0];
      if (id) ids.push(id);
    }
  }
  return ids;
}

function joinRelSafe(a = "", b = "") {
  a = (a || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  b = (b || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return [a, b].filter(Boolean).join("/");
}

/* ---------------- routes ---------------- */

// ---------- CREATE MODEL ----------
router.post('/models/create', upload.array('files'), async (req, res) => {
  try {
    const owner      = req.body.owner || '';
    const title      = req.body.title || '';
    const description = (req.body.description || '').trim();
    const visibility = (req.body.visibility || 'private').toLowerCase();
    const userId     = getUserId(req); 

    // collect metadata fields
    const howToUse          = req.body.howToUse || "";
    const dataSources       = req.body.dataSources || "";
    const pipelineTag       = req.body.pipelineTag || "";
    const library           = req.body.library || "";
    const languages         = (typeof req.body.languages === "string")
      ? req.body.languages.split(",").map(s => s.trim()).filter(Boolean)
      : Array.isArray(req.body.languages) ? req.body.languages : [];
    const license           = req.body.license || "";
    const intendedUse       = req.body.intendedUse || "";
    const outOfScope        = req.body.outOfScope || "";
    const systemRequirements= req.body.systemRequirements || "";
    const modelSize         = req.body.modelSize || "";
    const dataClassification= req.body.dataClassification || "";
    const lastUpdated       = req.body.lastUpdated || new Date().toISOString();

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
    const basePublic  = `models/${id}`;
    const basePrivate = `users/${userId}/models/${id}`;

    const container = getOCDSBlobServiceClient().getContainerClient(CONTAINER);
    await container.createIfNotExists();

    const manifest = {
      id,
      name: title || id,
      owner,
      description,
      tags,
      private: !makePublic,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      downloads: 0,
      sourcePath: basePrivate,
      howToUse,
      dataSources,
      pipelineTag,
      library,
      languages,
      license,
      intendedUse,
      outOfScope,
      systemRequirements,
      modelSize,
      dataClassification,
      lastUpdated,
    };

    await container.getBlockBlobClient(`${basePrivate}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(manifest, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    let rels = req.body.paths || req.body['paths[]'];
    if (!Array.isArray(rels)) rels = typeof rels === 'string' ? [rels] : [];

    for (let i = 0; i < (req.files || []).length; i++) {
      const f = req.files[i];
      const rel = cleanRelPath(rels[i] || f.originalname);
      if (!rel) continue;
      const target = `${basePrivate}/files/${rel}`;
      await container.getBlockBlobClient(target).uploadData(f.buffer, {
        blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
      });
    }

    if (makePublic) {
      const pubMan = { ...manifest, private: false, sourcePath: basePublic };
      await container.getBlockBlobClient(`${basePublic}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubMan, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );
      if (await blobExists(container, `${basePrivate}/README.md`)) {
        await copyBlob(container, `${basePrivate}/README.md`, `${basePublic}/README.md`, "text/markdown; charset=utf-8");
      }
      await copyTree(container, `${basePrivate}/files/`, `${basePublic}/files/`);
    }

    res.json({ ok: true, privateBase: basePrivate, publicBase: makePublic ? basePublic : null, manifest, fileCount: (req.files || []).length });
  } catch (e) {
    console.error('models/create error:', e);
    res.status(500).json({ error: 'create failed', details: e.message });
  }
});

// ---------- LIST PUBLIC MODELS ----------
router.get('/models', async (_req, res) => {
  try {
    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);
    const ids = await listTopLevelIds(c, 'models/');
    const items = [];

    const limit = 24;
    let i = 0;
    const work = Array.from({ length: Math.min(limit, ids.length) }, async function worker() {
      while (i < ids.length) {
        const idx = i++; const id = ids[idx];
        const key = `models/${id}/manifest.json`;
        const bc = c.getBlobClient(key);
        if (await bc.exists()) {
          const buf = await bc.downloadToBuffer();
          const man = JSON.parse(buf.toString('utf8'));
          if (man && man.id === id) items.push(man);
        }
      }
    });
    await Promise.all(work);

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

    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);
    const base = `users/${userId}/models/`;
    const ids = await listTopLevelIds(c, base);
    const items = [];

    const limit = 24;
    let i = 0;
    const work = Array.from({ length: Math.min(limit, ids.length) }, async function worker() {
      while (i < ids.length) {
        const idx = i++; const id = ids[idx];
        const privKey = `${base}${id}/manifest.json`;
        const pubKey  = `models/${id}/manifest.json`;
        const [privExists, pubExists] = await Promise.all([
          c.getBlobClient(privKey).exists(),
          c.getBlobClient(pubKey).exists(),
        ]);

        if (!privExists && !pubExists) continue;

        // Prefer private manifest content if present, but derive visibility from public existence
        let man = null;
        if (privExists) {
          const buf = await c.getBlobClient(privKey).downloadToBuffer();
          man = JSON.parse(buf.toString('utf8'));
        } else {
          const buf = await c.getBlobClient(pubKey).downloadToBuffer();
          man = JSON.parse(buf.toString('utf8'));
        }

        man.private = !pubExists;
        man.publicBase = pubExists ? `models/${id}` : null;
        man.sourcePath = man.private ? `${base}${id}` : `models/${id}`;

        if (man && man.id === id) items.push(man);
      }
    });
    await Promise.all(work);

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
    const client = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

    const tryPaths = [
      `models/${id}/manifest.json`,
      userId ? `users/${userId}/models/${id}/manifest.json` : null,
    ].filter(Boolean);

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
    const client = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

    const publicPrefix  = `models/${id}/files/`;
    const privatePrefix = userId ? `users/${userId}/models/${id}/files/` : null;

    const prefixes = [privatePrefix, publicPrefix].filter(Boolean);
    const JUNK = new Set(['.keep', '.DS_Store', 'Thumbs.db']);

    let blobs = [];
    for (const prefix of prefixes) {
      const tmp = [];
      for await (const b of client.listBlobsFlat({ prefix })) {
        const leaf = b.name.split('/').pop();
        if (JUNK.has(leaf)) continue;
        tmp.push({
          name: b.name,
          size: b.properties?.contentLength ?? 0,
          lastModified: b.properties?.lastModified ?? null,
          contentType: b.properties?.contentType ?? 'application/octet-stream',
        });
      }
      if (tmp.length) { blobs = tmp; break; }
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

    const container = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

    const rootMan = await readJson(container, `${privBase}/manifest.json`);
    if (!rootMan) return res.status(404).json({ error: 'model not found' });

    rootMan.updatedAt = new Date().toISOString();
    await container.getBlockBlobClient(`${privBase}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(rootMan, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    let rels = req.body.paths || req.body["paths[]"];
    if (!Array.isArray(rels)) rels = (typeof rels === "string") ? [rels] : [];

    const targetDirRaw = req.body.targetDir || req.body.target || req.body.dir || req.body.prefix || "";
    const targetDir = cleanRelPath(targetDirRaw) || "";

    const uploaded = [];

    for (let i = 0; i < (req.files || []).length; i++) {
      const f = req.files[i];
      const relBase = (rels && rels[i]) ? rels[i] : f.originalname;
      const relJoined = joinRelSafe(targetDir, relBase);
      const rel = cleanRelPath(relJoined);
      if (!rel) continue;

      // always upload to private
      await container.getBlockBlobClient(`${privBase}/files/${rel}`).uploadData(f.buffer, {
        blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
      });
      uploaded.push(`${privBase}/files/${rel}`);

      // mirror if base was public
      if (isPublic) {
        await container.getBlockBlobClient(`${pubBase}/files/${rel}`).uploadData(f.buffer, {
          blobHTTPHeaders: { blobContentType: f.mimetype || 'application/octet-stream' }
        });
        uploaded.push(`${pubBase}/files/${rel}`);

        const pubRoot = { ...rootMan, private: false, sourcePath: pubBase };
        await container.getBlockBlobClient(`${pubBase}/manifest.json`).uploadData(
          Buffer.from(JSON.stringify(pubRoot, null, 2)),
          { blobHTTPHeaders: { blobContentType: 'application/json' } }
        );
      }
    }

    res.json({ ok: true, uploaded });
  } catch (e) {
    console.error('append error:', e?.message || e);
    res.status(500).json({ error: 'append failed', details: e?.message || String(e) });
  }
});

/* ---------------- DELETE files from an existing model ---------------- */
router.delete('/models/file', async (req, res) => {
  try {
    const base = (req.body.base || '').toString().replace(/\/+$/, '');
    let deletes = req.body.filePaths ?? req.body['filePaths[]'] ?? req.body.filePath;
    if (!base || (!deletes || (Array.isArray(deletes) && deletes.length === 0))) {
      return res.status(400).json({ error: 'base and filePaths (or filePath) required' });
    }
    deletes = Array.isArray(deletes) ? deletes : [deletes];

    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'userId required' });

    const parts = base.split('/');
    const id = parts[parts.length - 1];
    const privBase = `users/${userId}/models/${id}`;
    const pubBase  = `models/${id}`;
    const isPublic = base.startsWith('models/');

    const container = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

    const rootMan = await readJson(container, `${privBase}/manifest.json`);
    if (!rootMan) return res.status(404).json({ error: 'model not found' });

    rootMan.updatedAt = new Date().toISOString();
    await container.getBlockBlobClient(`${privBase}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(rootMan, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    const actuallyDeleted = [];

    for (const relRaw of deletes) {
      const rel = cleanRelPath(relRaw);
      if (!rel) continue;

      // try folder first (private)
      const folderPrefixPriv = `${privBase}/files/${rel.replace(/\/+$/,'')}/`;
      let foundAny = false;
      for await (const b of container.listBlobsFlat({ prefix: folderPrefixPriv })) {
        await container.deleteBlob(b.name).catch(() => {});
        foundAny = true;
        actuallyDeleted.push(b.name);
      }
      if (!foundAny) {
        // else single file (private)
        const singlePriv = `${privBase}/files/${rel}`;
        await container.deleteBlob(singlePriv).then(() => {
          actuallyDeleted.push(singlePriv);
        }).catch(() => {});
      }

      // if public base was targeted, also delete public mirror
      if (isPublic) {
        const folderPrefixPub = `${pubBase}/files/${rel.replace(/\/+$/,'')}/`;
        let pubFound = false;
        for await (const b of container.listBlobsFlat({ prefix: folderPrefixPub })) {
          await container.deleteBlob(b.name).catch(() => {});
          pubFound = true;
          actuallyDeleted.push(b.name);
        }
        if (!pubFound) {
          const singlePub = `${pubBase}/files/${rel}`;
          await container.deleteBlob(singlePub).then(() => {
            actuallyDeleted.push(singlePub);
          }).catch(() => {});
        }
      }
    }

    if (isPublic) {
      const pubRoot = { ...rootMan, private: false, sourcePath: pubBase };
      await container.getBlockBlobClient(`${pubBase}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubRoot, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );
    }

    res.json({ ok: true, deleted: actuallyDeleted });
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

    const container = getOCDSBlobServiceClient().getContainerClient(CONTAINER);
    await container.createIfNotExists();

    const privBase = `users/${userId}/models/${id}`;
    const pubBase  = `models/${id}`;

    const privMan = await readJson(container, `${privBase}/manifest.json`);
    if (!privMan) {
      return res.status(404).json({ error: 'model not found (private manifest missing)' });
    }

    if (makePublic) {
      // mirror files + README
      await copyTree(container, `${privBase}/files/`, `${pubBase}/files/`);
      if (await blobExists(container, `${privBase}/README.md`)) {
        await copyBlob(container, `${privBase}/README.md`, `${pubBase}/README.md`, "text/markdown; charset=utf-8");
      }

      const pubMan  = { ...privMan, private: false, sourcePath: pubBase, updatedAt: new Date().toISOString() };
      await container.getBlockBlobClient(`${pubBase}/manifest.json`).uploadData(
        Buffer.from(JSON.stringify(pubMan, null, 2)),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );
      return res.json(pubMan);
    }

    // make private: remove ONLY the public mirror
    await deleteTree(container, `${pubBase}/`);

    const newPrivMan = { ...privMan, private: true, sourcePath: privBase, updatedAt: new Date().toISOString() };
    await container.getBlockBlobClient(`${privBase}/manifest.json`).uploadData(
      Buffer.from(JSON.stringify(newPrivMan, null, 2)),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );

    return res.json(newPrivMan);
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
    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

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
    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

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
    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

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
    return res.type('text/markdown; charset=utf-8').send('');
  } catch (e) {
    console.error('readme get error:', e);
    res.status(500).json({ error: 'readme get failed', details: e.message });
  }
});

// accept BOTH methods so client and server won’t drift
router.put('/models/:id/readme', upsertReadme);
router.post('/models/:id/readme', upsertReadme);


/* ---------------- Manifest ---------------- */
router.get('/models/:id/manifest', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const c = getOCDSBlobServiceClient().getContainerClient(CONTAINER);

    const tryPaths = [
      userId ? `users/${userId}/models/${id}/manifest.json` : null,
      `models/${id}/manifest.json`,
    ].filter(Boolean);

    for (const p of tryPaths) {
      const blob = c.getBlobClient(p);
      if (await blob.exists()) {
        const buf = await blob.downloadToBuffer();
        return res.type('application/json').send(buf.toString('utf8'));
      }
    }

    return res.status(404).json({ error: 'manifest not found' });
  } catch (e) {
    console.error('manifest get error:', e);
    res.status(500).json({ error: 'manifest get failed', details: e.message });
  }
});

module.exports = router;
