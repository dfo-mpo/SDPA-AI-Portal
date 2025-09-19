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
  Chip, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert
} from "@mui/material";
import { Upload as UploadIcon, X as CloseIcon } from "lucide-react";
import * as repo from "../services/repoApi";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [files, setFiles] = useState([]);
  const [paths, setPaths] = useState([]);     // array of relPath (same length as files)
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const canSubmit = !isGuest && owner.trim() && title.trim() && description.trim() && files.length > 0 && !saving;

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
      if (!files.length) setError("Please attach at least one file.");
      else if (!description.trim()) setError("Please provide a short description.");
      return;
    }
    setError("");
    try {
      setSaving(true);
      const out = await repo.createModelWithPaths({
        owner: owner.trim(),
        name: title.trim(),
        description: description.trim(),
        tags,
        visibility,
        files,
        paths,       // <— send rel paths
        userId
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
    "& .MuiOutlinedInput-root": { height: 50 },            
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
            multiline maxRows={5}
            disabled={isGuest}
            sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
            />
        </Grid>

        {/* tags + visibility */}
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth size="small" label="Add tag"
            placeholder="Press Enter or comma to add"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onPaste={onTagPaste}
            disabled={isGuest}
          />
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {tags.map((t) => (
              <Chip key={t} size="small" label={t} onDelete={() => setTags(tags.filter(x => x !== t))} />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
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
            <Button
              variant="outlined"
              startIcon={<UploadIcon size={16} />}
              onClick={() => fileRef.current?.click()}
              disabled={isGuest}
            >
              Select files/folder
            </Button>
            {/* Folder picker support (Chrome/Edge) */}
            <input
              ref={fileRef}
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
