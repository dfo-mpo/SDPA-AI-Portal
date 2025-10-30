import axios from 'axios';

const API = 'http://localhost:4000/api'; // or use your proxy/env
const BASE = "http://localhost:8000/api";

/* ---------- Models ----------
- CRUD Operations for models
*/

// ---- helpers ----
async function getJSON(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchModels({ signal } = {}) {
  // [{ name, description, latest_version, latest_stage }]
  return getJSON(`${BASE}/models`, { signal });
}

async function fetchModelVersions(name, { signal } = {}) {
  // [ { name, version, current_stage, description, tags, ... } ]
  return getJSON(`${BASE}/models/${encodeURIComponent(name)}/versions`, { signal });
}

function newestVersion(versions) {
  if (!Array.isArray(versions) || versions.length === 0) return null;
  // backend tries to sort, but we’ll be safe on the client too
  return [...versions].sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0))[0];
}

function toTagArray(tagsObj) {
  if (!tagsObj || typeof tagsObj !== "object") return [];
  // convert {k:v} -> ["k:v"]
  return Object.entries(tagsObj).map(([k, v]) => `${k}:${v}`);
}

// ---------- List All Models ----------
export async function listModels() {
  const base = await fetchModels();
  const enriched = await Promise.all(
    base.map(async (m) => {
      try {
        const versions = await fetchModelVersions(m.name);
        const newest = newestVersion(versions);

        const description =
          (newest && (newest.description || (newest.tags && (newest.tags.description || newest.tags.summary)))) ||
          m.description ||
          "";

        return {
          id: m.name,
          name: m.name,
          description,
          latestVersion: m.latest_version || (newest && newest.version) || null,
          latestStage: m.latest_stage || (newest && newest.current_stage) || null,
          tags: newest ? toTagArray(newest.tags) : [],
          _versions: versions,
        };
      } catch {
        // If versions fetch fails, still return a minimal card
        return {
          id: m.name,
          name: m.name,
          description: m.description || "",
          latestVersion: m.latest_version || null,
          latestStage: m.latest_stage || null,
          tags: [],
          _versions: [],
        };
      }
    })
  );

  // Sort alphabetically by name
  enriched.sort((a, b) => a.name.localeCompare(b.name));
  return enriched;
}

// ---------- List All Uploads ----------
export async function listUploads(userId) {
  // Return an empty list to keep UI stable (or map from models if you wish)
  return [];
}

// ---------- Get a Model
export async function getModel(id, { userId } = {}) {
  const versions = await fetchModelVersions(id);
  const newest = newestVersion(versions);

  return {
    id,
    name: id,
    description:
      (newest && (newest.description || (newest.tags && (newest.tags.description || newest.tags.summary)))) || "",
    latestVersion: newest ? newest.version : null,
    latestStage: newest ? newest.current_stage : null,
    versions,
    tags: newest ? toTagArray(newest.tags) : [],
  };
}

// ---------- Create New Model
export async function createModelWithPaths({
  owner,
  name,
  description = "",
  howToUse = "",
  dataSources = "",
  tags = [],
  visibility = "private",
  files = [],
  paths = [],
  userId,
  pipelineTag,
  library,
  languages = [],
  license,
  intendedUse,
  outOfScope,
  systemRequirements,
  modelSize,
  dataClassification,
  lastUpdated,
  repoUrl
}) {
  const form = new FormData();
  form.append("owner", owner);
  form.append("title", name);
  form.append("description", description);
  form.append("howToUse", howToUse);
  form.append("dataSources", dataSources);
  form.append("visibility", visibility);
  if (userId) form.append("userId", userId);
  if (Array.isArray(tags)) form.append("tags", tags.join(","));

  // --- NEW metadata ---
  if (pipelineTag) form.append("pipelineTag", pipelineTag);
  if (library) form.append("library", library);
  if (Array.isArray(languages)) form.append("languages", languages.join(","));
  if (license) form.append("license", license);
  if (intendedUse) form.append("intendedUse", intendedUse);
  if (outOfScope) form.append("outOfScope", outOfScope);
  if (systemRequirements) form.append("systemRequirements", systemRequirements);
  if (modelSize) form.append("modelSize", modelSize);
  if (dataClassification) form.append("dataClassification", dataClassification);
  if (lastUpdated) form.append("lastUpdated", lastUpdated);
  if (repoUrl) form.append("repoUrl", repoUrl);

  files.forEach((f, i) => {
    form.append("files", f, f.name);
    form.append("paths", paths[i] || f.name);
  });

  const { data } = await axios.post(`${API}/models/create`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(userId ? { "x-user-id": userId } : {}),
    },
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

// ---------- Append files (add button in frontend)
export async function uploadModelFiles({ id, files = [], isPrivate, userId, sourcePath, dir = "", paths = [] }) {
  if (!userId) throw new Error("uploadModelFiles requires userId");

  const base = sourcePath || (
    isPrivate ? `users/${encodeURIComponent(userId)}/models/${id}` : `models/${id}`
  );

  const form = new FormData();
  form.append("base", base);
  form.append("dir", dir);
  form.append("userId", userId);

  files.forEach((f, i) => {
    form.append("files", f, f.name);
    form.append("paths", paths[i] || f.name); // critical
  });

  const { data } = await axios.post(`${API}/models/append`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-user-id": userId,
    },
  });

  return data;
}

// ---------- Delete files
export async function deleteModelFile({ id, filePath, isPrivate, userId, sourcePath }) {
  const base = sourcePath || (isPrivate
    ? `users/${encodeURIComponent(userId)}/models/${id}`
    : `models/${id}`);

  // filePath is relative inside /files/
  const { data } = await axios.delete(`${API}/models/file`, {
    data: { base, filePath, userId },
  });
  return data;
}



/* ---------- Settings ---------- */
// change visibility
export async function updateVisibility(id, { visibility, userId }) {
  const { data } = await axios.patch(
    `${API}/models/${encodeURIComponent(id)}/visibility`,
    { visibility, userId },
    { headers: userId ? { 'x-user-id': userId } : {} }
  );
  return data;
}

// update metadata (name/owner/description/tags)
export async function updateMeta(id, { 
  name, 
  owner, 
  description, 
  howToUse, 
  dataSources, 
  tags, 
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
  repoUrl,
  userId }) {
  const { data } = await axios.patch(
    `${API}/models/${encodeURIComponent(id)}/meta`,
    { name, 
  owner, 
  description, 
  howToUse, 
  dataSources, 
  tags, 
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
  repoUrl,
  userId },
    { headers: userId ? { 'x-user-id': userId } : {} }
  );
  return data;
}

// delete repository
export async function deleteModel(id, { userId }) {
  const { data } = await axios.delete(
    `${API}/models/${encodeURIComponent(id)}`,
    { data: { userId }, headers: userId ? { 'x-user-id': userId } : {} }
  );
  return data;
}



/* ---------- Overview Tab ---------- */
// get README.md
export async function getReadme(id, { userId } = {}) {
  const res = await axios.get(`${API}/models/${encodeURIComponent(id)}/readme`, {
    params: userId ? { userId } : {}
  });
  return typeof res.data === 'string' ? res.data : (res.data ?? '');
}

// save README.md
export async function saveReadme(id, { markdown, userId }) {
  const { data } = await axios.put(
    `${API}/models/${encodeURIComponent(id)}/readme`,
    { markdown, userId },
    { headers: userId ? { 'x-user-id': userId } : {} }
  );
  return data;
}


/* ---------- Manifest.json ---------- */
// get Manifest
export async function getManifest(id, { userId } = {}) {
  const res = await axios.get(
    `${API}/models/${encodeURIComponent(id)}/manifest`,
    { params: userId ? { userId } : {} }
  );
  return res.data; // should be the JSON contents of manifest.json
}
