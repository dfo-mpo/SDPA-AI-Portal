// Simple in-memory mocks. Replace these with Azure Blob Storage + metadata calls.
let MODELS = [
  { id: "m1", name: "SalmonClassifier", description: "CNN for fish species identification.", tags: ["vision","onnx","research"], version: "1.2.0", updatedAt: "2025-08-30", downloads: 812, sizeMB: 142, private: false, readme: "## SalmonClassifier\n\nExample README..." },
  { id: "m2", name: "MADLAD-400 (10B) FT", description: "Domain-tuned English→French translation.", tags: ["nlp","translation","safetensors"], version: "0.9.1", updatedAt: "2025-08-22", downloads: 1254, sizeMB: 9800, private: true, readme: "## MADLAD FT\n\nUsage details..." },
  { id: "m3", name: "MADLAD-400 (10B) FT", description: "Domain-tuned English→French translation.", tags: ["nlp","translation","safetensors"], version: "0.9.1", updatedAt: "2025-08-22", downloads: 1254, sizeMB: 9800, private: true, readme: "## MADLAD FT\n\nUsage details..." },
  { id: "m4", name: "MADLAD-400 (10B) FT", description: "Domain-tuned English→French translation.", tags: ["nlp","translation","safetensors"], version: "0.9.1", updatedAt: "2025-08-22", downloads: 1254, sizeMB: 9800, private: true, readme: "## MADLAD FT\n\nUsage details..." }

];
let UPLOADS = [
  { id: "u1", name: "SockeyeRiskScore", description: "Risk scoring model for seasonal closures.", tags: ["risk","policy","sklearn"], version: "0.3.2", updatedAt: "2025-08-29", downloads: 54, sizeMB: 3, private: true },
  { id: "u2", name: "CohoBycatchDetector", description: "Object detection head for bycatch frames.", tags: ["vision","yolo"], version: "0.1.0", updatedAt: "2025-08-18", downloads: 102, sizeMB: 86, private: false },
  { id: "u3", name: "CohoBycatchDetector", description: "Object detection head for bycatch frames.", tags: ["vision","yolo"], version: "0.1.0", updatedAt: "2025-08-18", downloads: 102, sizeMB: 86, private: false },
  { id: "u4", name: "CohoBycatchDetector", description: "Object detection head for bycatch frames.", tags: ["vision","yolo"], version: "0.1.0", updatedAt: "2025-08-18", downloads: 102, sizeMB: 86, private: false },
  { id: "u5", name: "CohoBycatchDetector", description: "Object detection head for bycatch frames.", tags: ["vision","yolo"], version: "0.1.0", updatedAt: "2025-08-18", downloads: 102, sizeMB: 86, private: false },
];

export const listModels = async () => Promise.resolve(MODELS);
export const listUploads = async () => Promise.resolve(UPLOADS);
export const getModel = async (id) => Promise.resolve([...MODELS, ...UPLOADS].find((m) => m.id === id));
export const createModel = async ({ owner, name, tags, private: isPrivate, files }) => {
  const id = `m${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString().slice(0, 10);
  const row = { id, name, description: "", tags, version: "0.1.0", updatedAt: now, downloads: 0, sizeMB: 0, private: !!isPrivate, readme: "" };
  UPLOADS = [row, ...UPLOADS];
  MODELS = [row, ...MODELS];
  return row;
};
export const updateModel = async (id, patch) => {
  const apply = (list) => {
    const i = list.findIndex((m) => m.id === id);
    if (i >= 0) list[i] = { ...list[i], ...patch };
  };
  apply(MODELS);
  apply(UPLOADS);
  return [...MODELS, ...UPLOADS].find((m) => m.id === id);
};
