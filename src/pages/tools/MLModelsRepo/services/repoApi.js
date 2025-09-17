import axios from 'axios';

const API = 'http://localhost:4000/api'; // or use your proxy/env

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


// ---------- List files for a model
export async function listModelFilesById(id, { userId } = {}) {
  const { data } = await axios.get(
    `${API}/models/${encodeURIComponent(id)}/files`,
    { params: userId ? { userId } : {} }
  );
  return Array.isArray(data?.items) ? data.items : [];
}

// ---------- Append files (contribute button in frontend)
export async function uploadModelFiles({ id, files, isPrivate, userId, sourcePath }) {
  const base = sourcePath || (isPrivate ? `users/${encodeURIComponent(userId)}/models/${id}` : `models/${id}`);
  const form = new FormData();
  form.append("base", base);
  for (const f of files) form.append("files", f, f.name);

  const { data } = await axios.post(`${API}/models/append`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}