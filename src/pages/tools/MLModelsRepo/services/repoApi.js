import axios from 'axios';

const BASE = '/api/api'; // or use your proxy/env

/* tiny helpers: frontend-only mapping for display */
const toTagArray = (tags) =>
  tags && typeof tags === "object"
    ? Object.entries(tags).map(([k, v]) => `${k}:${v}`)
    : [];
  
const toFlavorKeys = (flavors) =>
  !flavors ? [] : Array.isArray(flavors) ? flavors : Object.keys(flavors);

const mapToItem = (card) => {
  const tagArr = toTagArray(card.tags);
  const flavorArr = toFlavorKeys(card.flavors);

  return {
    id: `${card.name}@v${card.version}`,
    name: card.name,
    version: String(card.version ?? ""),
    description: card.description || "",
    type: card.type,
    tags: tagArr,
      tagsText: tagArr.join(", "),
      flavors: flavorArr,
      flavorsText: flavorArr.join(", "),
    createdOn: card.created_on || "",
    lastUpdatedOn: card.last_updated_on || "",
    latestVersion: card.latest_version,
    versionCount: card.version_count,
    downloadUrl: getDownloadUrl(card.name, card.version),
  }
};

/**
 * GET /api/models/
 * Returns latest version metadata for a model.
 * - card: raw backend JSON (exact fields)
 * - item: UI mapping
 */
export async function listModels() {
  const url = `${BASE}/models`;
  const { data } = await axios.get(url);
  // keep your mapping consistent with the rest of the UI
  return { cards: data, items: data.map(mapToItem) };
}

/**
 * GET /api/models/{name}/versions/{version}
 * Returns metadata for a specific version.
 * - card: raw backend JSON (exact fields)
 * - item: UI mapping (latestVersion/versionCount will be undefined here)
 */
export async function getModelVersion(name, version) {
  const url = `${BASE}/models/${encodeURIComponent(name)}/versions/${encodeURIComponent(String(version))}`;
  const { data } = await axios.get(url);
  return { card: data, item: mapToItem(data) };
}

/**
 * /api/models/{name}/versions/{version}/download.zip
 * Direct ZIP for that version
 */
export function getDownloadUrl(name, version) {
  return `${BASE}/models/${encodeURIComponent(name)}/versions/${encodeURIComponent(String(version))}/download.zip`;
}

/**
 * /api/models/{name}/versions/{version}/readme
 * Direct README reference
 */
export async function getAmlReadme(name, version) {
  const url = `${BASE}/models/${encodeURIComponent(
    name
  )}/versions/${encodeURIComponent(version)}/readme`;

  const res = await fetch(url);
  if (res.status === 404) {
    // no README for that model/version
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to load README: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

/**
 * /api/models/{name}/versions
 * Returns version list of a specific model
 */
export async function listModelVersions(name) {
  const url = `${BASE}/models/${encodeURIComponent(name)}/versions`;
  const { data } = await axios.get(url);
  return { cards: data, items: data.map(mapToItem) };
}
