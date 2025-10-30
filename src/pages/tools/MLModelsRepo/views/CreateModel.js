/**
 * Create Model
 *
 * Form for publishing a new ML model to the repository.
 * Requirements: user must be signed in; Owner, Title, Short description, and ≥1 file.
 * Visibility:
 *  - Private → stored at users/<userId>/models/<id> and shown only in “My Uploads”.
 *  - Public  → stored at models/<id> and also referenced in “My Uploads”.
 * On submit, uploads files and writes a manifest.json to Azure Blob, then calls onCreated().
 */

import React, { useRef, useState } from "react";
import {
  Box, Paper, Grid, Stack, TextField, Button, Typography, IconButton,
  Chip, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert,
  ListSubheader, Select, MenuItem, Checkbox, ListItemText, InputLabel,
  FormControl,
} from "@mui/material";
import { Upload as UploadIcon, X as CloseIcon } from "lucide-react";
import * as repo from "../services/repoApi";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

// --- Options ---
const PIPELINE_TAG_GROUPS = {
  "Natural Language Processing": [
    "text-classification",
    "token-classification",
    "question-answering",
    "zero-shot-classification",
    "translation",
    "summarization",
    "feature-extraction",
    "text-generation",
    "fill-mask",
    "sentence-similarity",
    "text-ranking",
    "table-question-answering",
    "conversational"
  ],
  "Audio & Speech": [
    "automatic-speech-recognition",
    "text-to-speech",
    "audio-classification",
    "voice-activity-detection",
    "text-to-audio",
    "audio-to-audio"
  ],
  "Computer Vision": [
    "depth-estimation",
    "image-classification",
    "object-detection",
    "image-segmentation",
    "text-to-image",
    "image-to-text",
    "image-to-image",
    "image-to-video",
    "unconditional-image-generation",
    "video-classification",
    "text-to-video",
    "zero-shot-image-classification",
    "mask-generation",
    "zero-shot-object-detection",
    "text-to-3d",
    "image-to-3d",
    "image-feature-extraction",
    "keypoint-detection",
    "video-to-video"
  ],
  "Rienforcement Learning": [
    "Reinforcement Learning",
    "Robotics"
  ],
  "Tabular": [
    "Tabular Classification",
    "Tabular Regression",
    "Tabular Series Forecasting"
  ],
  "Other": [
    "Graph Machine Learning"
  ]
};

const LIBRARIES = [
  'PyTorch', 'TensorFlow', 'ONNX', 'scikit-learn', 'XGBoost', 'LightGBM',
  'Transformers', 'Diffusers', 'Flair', 'fastai', 'Keras', 'KerasNLP',
  'AllenNLP', 'Asteroid', 'BERTopic', 'docTR', 'ESPnet', 'PEFT', 'PaddleNLP',
  'Sentence Transformers', 'NeMo', 'OpenCLIP', 'MLX', 'MidiTok', 'MBRL-Lib',
  'RL-Baselines3-Zoo', 'Sample Factory', 'ML-Agents', 'Pythae', 'Pyannote',
  'PyCTCDecode'
];

const LICENSES = [
  'Apache-2.0', 'MIT', 'BSD-3-Clause', 'BSD-2-Clause', 'BSD-3-Clause-Clear',
  'GPL-3.0', 'GPL-2.0', 'LGPL', 'AGPL-3.0', 'Creative Commons (CC0-1.0, CC-BY, CC-BY-SA, CC-BY-NC, CC-BY-ND)',
  'OpenRAIL', 'BigScience OpenRAIL-M', 'BigScience BLOOM RAIL 1.0',
  'BigCode Open RAIL-M v1', 'Academic Free License v3.0', 'Artistic-2.0',
  'Boost Software License 1.0', 'Computational Use of Data Agreement (C-UDA)',
  'Community Data License Agreement (CDLA)', 'Do What The F*ck You Want To Public License (WTFPL)',
  'Eclipse Public License (1.0, 2.0)', 'Etalab Open License 2.0',
  'European Union Public License (1.1, 1.2)', 'Proprietary'
];

const LANGUAGES_ALL = ['English', 'French'];
const DATA_CLASSIFICATIONS = ['Public','Internal','Confidential','Secret'];


async function readDataTransferItems(items) {
  const out = [];
  const readEntry = async (entry, prefix = "") => {
    if (entry.isFile) {
      const file = await new Promise((res, rej) => entry.file(res, rej));
      out.push({ file, relPath: prefix + file.name });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise((res, rej) => reader.readEntries(res, rej));
      for (const e of entries) await readEntry(e, prefix + entry.name + "/");
    }
  };
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) await readEntry(entry, "");
  }
  return out;
}

export default function CreateModel({ onCancel, onCreated, userId }) {
  const [owner, setOwner] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [dataSources, setDataSources] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [files, setFiles] = useState([]);
  const [paths, setPaths] = useState([]);     // array of relPath (same length as files)
  const fileRef = useRef(null);
  const folderRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // metadata UI
  const [pipelineTag, setPipelineTag] = useState("");
  const [library, setLibrary] = useState("");
  const [languages, setLanguages] = useState([]);
  const [license, setLicense] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [intendedUse, setIntendedUse] = useState("");      // bulleted textarea text
  const [outOfScope, setOutOfScope] = useState("");        // bulleted textarea text
  const [sysRequirements, setSysRequirements] = useState(""); // hardware/software
  const [modelSize, setModelSize] = useState("");          // string like "1.2 GB" or number of MB/bytes
  const [dataClassification, setDataClassification] = useState("");
  const [lastUpdated] = useState(() => new Date().toISOString()); // auto, read-only

  // Map relPath -> index in files/paths (for delete)
  const pathIndex = React.useMemo(
    () => Object.fromEntries(paths.map((p, i) => [p, i])),
    [paths]
  );
 
  // Build tree from rel paths (folders   files)
  const tree = React.useMemo(() => {
    const root = { name: "", dirs: new Map(), files: [] };
    for (const relPath of paths) {
      const parts = (relPath || "").split("/").filter(Boolean);
      if (!parts.length) continue;
      let node = root;
      for (let i = 0; i < parts.length; i ++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        if (isFile) {
          node.files.push({ name: part, full: relPath });
        } else {
          if (!node.dirs.has(part)) node.dirs.set(part, { name: part, dirs: new Map(), files: [] });
          node = node.dirs.get(part);
        }
      }
    }
    return root;
  }, [paths]);
 
  // Render tree nodes (folders first, then files)
  const renderNode = (node, path = "") => {
    const dirItems = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
    const fileItems = node.files.sort((a, b) => a.name.localeCompare(b.name));
    const idBase = path || "/";
    return (
      <>
        {dirItems.map((d) => {
          const id = `${idBase}${d.name}/`;
          return (
            <TreeItem key={id} itemId={id} label={d.name}>
              {renderNode(d, id)}
            </TreeItem>
          );
        })}
        {fileItems.map((f) => {
          const id = `${idBase}${f.name}`;
          const idx = pathIndex[f.full];
          const size =
            typeof idx === "number" && files[idx]
              ? ` • ${(files[idx].size / (1024 * 1024)).toFixed(2)} MB`
              : "";
          return (
            <TreeItem
              key={id}
              itemId={id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1, m: -0.5 }}>
                  <Typography variant="body2">{`${f.name}${size}`}</Typography>
                  <IconButton
                    size="small"
                    aria-label={`remove ${f.full}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof idx === "number") {
                        setFiles((prev) => prev.filter((_, i) => i !== idx));
                        setPaths((prev) => prev.filter((_, i) => i !== idx));
                      }
                    }}
                  >
                    <CloseIcon size={14} />
                  </IconButton>
                </Box>
              }
            />
          );
        })}
      </>
    );
  };

  const isGuest = !userId || userId === "me";

  const requiredOk =
    owner.trim() &&
    title.trim() &&
    description.trim() &&
    howToUse.trim() &&
    dataSources.trim() &&
    pipelineTag &&
    library &&
    license &&
    languages.length > 0 &&
    tags.length > 0 &&
    intendedUse.trim() &&
    outOfScope.trim() &&
    sysRequirements.trim() &&
    modelSize.trim() &&
    dataClassification &&
    files.length > 0;

  const canSubmit = !isGuest && requiredOk && !saving;

  const addTag = (raw) => {
    const v = raw.trim().replace(/,$/, "");
    if (!v) return;
    setTags((prev) => (prev.includes(v) ? prev : [...prev, v]));
  };
  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };
  const onTagPaste = (e) => {
    const txt = e.clipboardData.getData("text");
    if (txt.includes(",")) {
      e.preventDefault();
      txt.split(",").map((s) => s.trim()).filter(Boolean).forEach(addTag);
      setTagInput("");
    }
  };

  // dedupe by relPath+size
  const addPairs = (pairs) => {
    setFiles((prevFiles) => {
      const prevKeys = new Set(prevFiles.map((f, i) => `${(paths[i]||f.name)}-${f.size}`));
      const nextFiles = [...prevFiles];
      const nextPaths = [...paths];
      for (const { file, relPath } of pairs) {
        const key = `${relPath || file.name}-${file.size}`;
        if (!prevKeys.has(key)) {
          prevKeys.add(key);
          nextFiles.push(file);
          nextPaths.push(relPath || file.name);
        }
      }
      setPaths(nextPaths);
      return nextFiles;
    });
  };

  const pickFiles = (e) => {
    const arr = Array.from(e.target.files || []);
    addPairs(arr.map(f => ({ file: f, relPath: f.webkitRelativePath || f.name })));
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const items = e.dataTransfer?.items;
    if (items && items[0]?.webkitGetAsEntry) {
      const pairs = await readDataTransferItems(items);
      addPairs(pairs);
    } else {
      const arr = Array.from(e.dataTransfer?.files || []);
      addPairs(arr.map(f => ({ file: f, relPath: f.name })));
    }
  };
  const onDragOver = (e) => e.preventDefault();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isGuest){
      setError("You must sign in to create a model.");
      return;
    }
    
    if (!canSubmit) {
      let msg = "Please fill all required fields and attach at least one file.";
      if (!files.length) msg = "Please attach at least one file.";
      setError(msg);
      return;
    }
    setError("");
    try {
      setSaving(true);
      const out = await repo.createModelWithPaths({
        owner: owner.trim(),
        name: title.trim(),
        description: description.trim(),
        howToUse: howToUse.trim(),
        dataSources: dataSources.trim(),
        tags,
        visibility,
        files,
        paths,       // rel paths for each file
        userId,
        pipelineTag,
        library,
        languages,
        license,
        intendedUse,
        outOfScope,
        systemRequirements: sysRequirements,
        modelSize,
        dataClassification,
        lastUpdated,
      });
      const newId = out?.manifest?.id;
      onCreated?.(newId);
    } catch {
      setError("Could not create the model. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tallInput = {
    "& .MuiOutlinedInput-root": { height: 40 },            
    "& .MuiOutlinedInput-input": { py: 1.25 }              
  };

  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      elevation={1}
      sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: "100%", maxWidth: 900 }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>Create a New Model</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add the basics, choose visibility, and attach files.
      </Typography>

      {isGuest && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You’re not signed in. Please sign in to create and upload models.
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" required label="Owner name"
            value={owner} onChange={(e) => setOwner(e.target.value)} disabled={isGuest} sx={tallInput}/>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" required label="Model title"
            value={title} onChange={(e) => setTitle(e.target.value)} disabled={isGuest} sx={tallInput}/>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="Short description"
            placeholder="One or two sentences about this model"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
            />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="How to use this model"
            placeholder="Describe basic usage, quickstart commands, expected input/output"
            value={howToUse}
            onChange={(e) => setHowToUse(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="Where was the data sourced?"
            placeholder="List datasets, collection methods, links, licensing constraints"
            value={dataSources}
            onChange={(e) => setDataSources(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
          />
        </Grid>

        {/* ======== Metadata (All Mandatory) ======== */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth size="small" required
            label="Pipeline Tag"
            value={pipelineTag}
            disabled={isGuest}
            onChange={(e) => {
              console.log("Picked:", e.target.value);
              setPipelineTag(e.target.value);
            }}
            SelectProps={{
              MenuProps: { PaperProps: { sx: { maxHeight: 400 } } },
            }}
          >
            <MenuItem disabled value="">
              <em>Select a pipeline</em>
            </MenuItem>

            {Object.entries(PIPELINE_TAG_GROUPS).map(([category, tags]) => [
              <ListSubheader disableSticky sx={{ fontWeight: 700, opacity: 0.7}} key={category}>{category}</ListSubheader>,
              tags.map((tag) => (
                <MenuItem sx={{ pl: 3}}key={tag} value={tag}>
                  {tag}
                </MenuItem>
              )),
            ])}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth size="small" required
            label="Library / Framework"
            value={library}
            onChange={(e) => setLibrary(e.target.value)}
            sx={tallInput}
            disabled={isGuest}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 400,
                  },
                },
              },
            }}
          >
            <MenuItem disabled value="">
              <em>Select a library / framework</em>
            </MenuItem>
            {LIBRARIES.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth size="small" required
            label="License"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            sx={tallInput}
            disabled={isGuest}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 400,
                  },
                },
              },
            }}
          >
            <MenuItem disabled value="">
              <em>Select a license</em>
            </MenuItem>
            {LICENSES.map((lic) => (
              <MenuItem key={lic} value={lic}>
                {lic}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth size="small" required
            label="Model Size"
            placeholder="e.g., 1.3 GB or 980 MB"
            value={modelSize}
            onChange={(e) => setModelSize(e.target.value)}
            sx={tallInput}
            disabled={isGuest}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small" required disabled={isGuest}>
            <InputLabel id="languages-label">Languages</InputLabel>
            <Select
              labelId="languages-label"
              multiple
              value={languages}
              onChange={(e) =>
                setLanguages(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : e.target.value
                )
              }
              renderValue={(selected) =>
                selected.length ? selected.join(", ") : "Select languages"
              }
            >
              {LANGUAGES_ALL.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  <Checkbox checked={languages.indexOf(lang) > -1} />
                  <ListItemText primary={lang} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth size="small" required
            label="Data Classification"
            value={dataClassification}
            onChange={(e) => setDataClassification(e.target.value)}
            sx={tallInput}
            disabled={isGuest}
          >
            <MenuItem disabled value="">
              <em>Select a library / framework</em>
            </MenuItem>
            {DATA_CLASSIFICATIONS.map((lic) => (
              <MenuItem key={lic} value={lic}>
                {lic}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="Intended Use"
            placeholder="Eg. 
            Fine-tune on XYZ,
            Inference for ABC"
            value={intendedUse}
            onChange={(e) => setIntendedUse(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="Out of Scope / Limitations"
            placeholder="Eg. 
            Not for PII extraction,
            Not for medical diagnosis"
            value={outOfScope}
            onChange={(e) => setOutOfScope(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="System Requirements (hardware / software)"
            placeholder="GPU: A10 or better; RAM: 16GB+; CUDA 12.1; Python 3.10"
            value={sysRequirements}
            onChange={(e) => setSysRequirements(e.target.value)}
            multiline maxRows={4}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 100, alignItems: "flex-start" } }}
          />
        </Grid>

        <Grid item xs={12} md={3.5}>
          <TextField
            fullWidth size="small"
            label="Last Updated"
            value={new Date(lastUpdated).toLocaleString()}
            InputProps={{ readOnly: true }}
            helperText="Auto-populated on create"
            sx={tallInput}
            disabled={isGuest}
          />
        </Grid>

        {/* tags + visibility */}
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth size="small" label="Add tag"
            placeholder="Press Enter or comma to add"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onPaste={onTagPaste}
            sx={tallInput}
            disabled={isGuest}
          />
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {tags.map((t) => (
              <Chip key={t} size="small" label={t} onDelete={() => setTags(tags.filter(x => x !== t))} />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={3.5}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Visibility
          </Typography>
          <RadioGroup
            row
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            name="visibility"
          >
            <FormControlLabel value="private" control={<Radio size="small" />} label="Private" />
            <FormControlLabel value="public" control={<Radio size="small" />} label="Public" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
        <Box
          onDrop={onDrop}
          onDragOver={onDragOver}
          sx={{
            p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap",
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Model files & folders</Typography>
            <Typography variant="caption" color="text.secondary">
              Drag & drop files/folders, or pick a folder. Folder structure is preserved.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {/* Pick files */}
            <Button
              variant="outlined"
              startIcon={<UploadIcon size={16} />}
              onClick={() => fileRef.current?.click()}
              disabled={isGuest}
            >
              Select files
            </Button>
            <input
              ref={fileRef}
              type="file"
              hidden
              multiple
              onChange={pickFiles}
            />

            {/* Pick folders */}
            <Button
              variant="outlined"
              startIcon={<UploadIcon size={16} />}
              onClick={() => folderRef.current?.click()}
              disabled={isGuest}
            >
              Select folder
            </Button>
            <input
              ref={folderRef}
              type="file"
              hidden
              multiple
              webkitdirectory="true"
              onChange={pickFiles}
            />
          </Stack>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mt: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <SimpleTreeView
              defaultCollapseIcon={<span>▾</span>}
              defaultExpandIcon={<span>▸</span>}
              sx={{ maxHeight: 380, overflow: "auto", p: 1 }}
            >
               {renderNode(tree, "")}
             </SimpleTreeView>
             <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
               <Typography variant="caption" color="text.secondary">
               {files.length} file{files.length !== 1 ? "s" : ""} staged
               </Typography>
             </Box>
           </Box>
         )}
      </Grid>

        {error && (
          <Grid item xs={12}><Typography variant="body2" color="error">{error}</Typography></Grid>
        )}

        <Grid item xs={12}>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ whiteSpace: "nowrap" }}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              // disabled={!canSubmit}
            >
              {saving ? "Saving…" : "Create"}
            </Button>
            <Button variant="text" onClick={onCancel}>Cancel</Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
