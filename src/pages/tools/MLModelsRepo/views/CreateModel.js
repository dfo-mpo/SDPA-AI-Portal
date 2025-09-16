// src/pages/tools/MLModelsRepo/views/CreateModel.js
import React, { useRef, useState } from "react";
import {
  Box, Paper, Grid, Stack, TextField, Button, Typography, IconButton,
  Chip, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert
} from "@mui/material";
import { Upload as UploadIcon, X as CloseIcon } from "lucide-react";
import * as repo from "../services/repoApi";

export default function CreateModel({ onCancel, onCreated, userId }) {
  const [owner, setOwner] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

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

  const pickFiles = (e) => {
    const arr = Array.from(e.target.files || []);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...arr.filter((f) => !seen.has(`${f.name}-${f.size}`))];
    });
  };
  const removeFile = (f) => setFiles((prev) => prev.filter((x) => x !== f));

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
      await repo.createModel({
        owner: owner.trim(),
        name: title.trim(),
        description: description.trim(),
        tags,
        visibility,
        files,
        userId
      });
      onCreated?.();
    } catch {
      setError("Could not create the model. Please try again.");
    } finally {
      setSaving(false);
    }
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
            value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" required label="Model title"
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth size="small" required
            label="Short description"
            placeholder="One or two sentences about this model"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline maxRows={3}
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
            sx={{
              p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap",
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Model files</Typography>
              <Typography variant="caption" color="text.secondary">
                Select one or more files.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon size={16} />}
                onClick={() => fileRef.current?.click()}
                disabled={isGuest}
              >
                Select files
              </Button>
              <input ref={fileRef} type="file" hidden multiple onChange={pickFiles} />
            </Stack>
          </Box>

          {files.length > 0 && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {files.map((f) => (
                <Stack key={`${f.name}-${f.size}`} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" noWrap title={f.name}>{f.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {(f.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`remove ${f.name}`}
                      onClick={() =>
                        setFiles((prev) => prev.filter((x) => x !== f))
                      }
                    >
                      <CloseIcon size={14} />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
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
