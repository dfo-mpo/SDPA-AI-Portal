import axios from 'axios';

const API = 'http://localhost:4000/api'; // or use your proxy/env

// Helper to add x-user-id header when we have a userId
function withUser(config = {}, userId) {
  if (!userId) return config;
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      'x-user-id': userId,
    },
  };
}

/* ---------- Models ----------
- CRUD Operations for models
*/

// ---------- List All Models ----------
export async function listModels() {
  const { data } = await axios.get(`${API}/models`);
  return (data.items || []).map(x => ({
    id: x.id,
    name: x.name,
    description: x.description || '',
    tags: x.tags || [],
    version: x.version || '1.0.0',
    updatedAt: x.updatedAt,
    downloads: x.downloads || 0,
    sizeMB: x.sizeMB || 0,
    private: !!x.private,
    sourcePath: x.sourcePath
  }));
}

// ---------- List All Uploads ----------
export async function listUploads(userId) {
  if (!userId) return [];
  const { data } = await axios.get(`${API}/uploads`, { params: { userId } });
  return (data.items || []).map(x => ({
    id: x.id,
    name: x.name,
    description: x.description || '',
    tags: x.tags || [],
    version: x.version || '1.0.0',
    updatedAt: x.updatedAt,
    downloads: x.downloads || 0,
    sizeMB: x.sizeMB || 0,
    private: !!x.private,
    sourcePath: x.sourcePath
  }));
}

// ---------- Get a Model
export async function getModel(id, { userId } = {}) {
  const { data } = await axios.get(`${API}/models/${encodeURIComponent(id)}`, { params: { userId } });
  return data;
}

// ---------- Create New Model
export async function createModel({ owner, name, description = "", tags = [], visibility = 'private', files = [], userId }) {
  const form = new FormData();
  form.append('owner', owner);
  form.append('title', name);
  form.append('description', description);
  form.append('visibility', visibility);
  if (userId) form.append('userId', userId);
  if (Array.isArray(tags)) form.append('tags', tags.join(','));
  for (const f of files) form.append('files', f, f.name);

  const { data } = await axios.post(`${API}/models/create`, form, {
    headers: { 'Content-Type': 'multipart/form-data', ...(userId ? { 'x-user-id': userId } : {}) }
  });
  return data;
}


/* ---------- Files ---------- */
function resolveBase({ id, isPrivate, userId, sourcePath }) {
  if (sourcePath) return sourcePath;
  if (isPrivate) {
    if (!userId) throw new Error('userId required for private model path');
    return `users/${encodeURIComponent(userId)}/models/${id}`;
  }
  return `models/${id}`;
}

/**
 * List files for a model by asking the server to list blobs at {base}/files/
 * Your server already has /api/blob/list which reads via connection string.
 */
export async function listModelFiles({ id, isPrivate, userId, container = 'mlmodels', sourcePath }) {
  const base = resolveBase({ id, isPrivate, userId, sourcePath });
  const { data } = await axios.get(`${API}/blob/list`, { params: { container, prefix: `${base}/files/` } });
  const blobs = Array.isArray(data?.blobs) ? data.blobs : [];
  return blobs.map(b => ({
    name: b.name,
    size: b.size ?? b.contentLength ?? 0,
    lastModified: b.last_modified ?? b.properties?.lastModified,
    contentType: b.content_type ?? b.properties?.contentType
  }));
}

/**
 * (Optional) Append files after creation (no SAS).
 * Requires the tiny /api/models/append route below.
 */
export async function uploadModelFiles({ id, files, isPrivate, userId, container = 'mlmodels', sourcePath }) {
  const base = resolveBase({ id, isPrivate, userId, sourcePath });
  const form = new FormData();
  form.append('base', base);
  for (const f of files) form.append('files', f, f.name);

  const cfg = withUser({ headers: { 'Content-Type': 'multipart/form-data' } }, userId);
  const { data } = await axios.post(`${API}/models/append`, form, cfg);
  return data;
}