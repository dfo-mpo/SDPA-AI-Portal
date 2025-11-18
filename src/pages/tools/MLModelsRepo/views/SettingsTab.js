import React, { useMemo, useState } from "react";
import {
  Box, Paper, Stack, Typography, Button, TextField, Alert, RadioGroup,
  FormControlLabel, Radio, Grid, Select, MenuItem, Checkbox, ListItemText,
  InputLabel, FormControl, Chip, ListSubheader
} from "@mui/material";
import * as repo from "../services/repoApi";

// ---- reuse your option lists (paste from CreateModel) ----
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

export function SettingsTab({ model, userId, onUpdated, onDeleted }) {
  // visibility
  const [visibility, setVisibility] = useState(model.private ? "private" : "public");

  // editable metadata (prefill from model/manifest merged server-side)
  const [owner, setOwner] = useState(model.owner || "");
  const [name, setName] = useState(model.name || "");
  const [description, setDescription] = useState(model.description || "");
  const [repoUrl, setRepoUrl] = useState(model.repoUrl || ""); // NEW

  const [pipelineTag, setPipelineTag] = useState(model.pipelineTag || "");
  const [library, setLibrary] = useState(model.library || "");
  const [license, setLicense] = useState(model.license || "");
  const [languages, setLanguages] = useState(
    Array.isArray(model.languages) ? model.languages : (model.languages ? [model.languages] : [])
  );
  const [modelSize, setModelSize] = useState(model.modelSize || "");
  const [dataClassification, setDataClassification] = useState(model.dataClassification || "");

  const [howToUse, setHowToUse] = useState(model.howToUse || "");
  const [dataSources, setDataSources] = useState(model.dataSources || "");
  const [intendedUse, setIntendedUse] = useState(model.intendedUse || "");
  const [outOfScope, setOutOfScope] = useState(model.outOfScope || "");
  const [systemRequirements, setSystemRequirements] = useState(model.systemRequirements || "");

  const [tags, setTags] = useState(
    Array.isArray(model.tags) ? model.tags : (typeof model.tags === "string" ? model.tags.split(",").map(s => s.trim()).filter(Boolean) : [])
  );
  const [tagInput, setTagInput] = useState("");

  // misc
  const [msgVis, setMsgVis] = useState("");    const [errVis, setErrVis] = useState("");
  const [msgId, setMsgId] = useState("");      const [errId, setErrId] = useState("");
  const [msgMeta, setMsgMeta] = useState("");  const [errMeta, setErrMeta] = useState("");
  const [msgUse, setMsgUse] = useState("");    const [errUse, setErrUse] = useState("");

  const [saving, setSaving] = useState(false);
  const canEdit = Boolean(userId) && !saving;

  const tallInput = {
    "& .MuiOutlinedInput-root": { height: 48 },
    "& .MuiOutlinedInput-input": { py: 1.25 }
  };

  const isValidUrl = useMemo(() => {
    if (!repoUrl.trim()) return true;
    return /^https?:\/\/\S+$/i.test(repoUrl.trim());
  }, [repoUrl]);

  const autoHide = (setter) => {
    setTimeout(() => setter(""), 4000);
  };

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

  // ----- Actions -----
  const saveVisibility = async () => {
    try {
      setSaving(true);
      setMsgVis(""); setErrVis("");
      const m = await repo.updateVisibility(model.id, { visibility, userId });
      onUpdated?.(m);
      setMsgVis("Visibility updated.");
      autoHide(setMsgVis);
     } catch {
      setErrVis("Update failed. Please try again.");
      autoHide(setErrVis);
    } finally { setSaving(false); }
  };

  const saveIdentity = async () => {
    if (!isValidUrl) {
      setErrId("Please enter a valid URL starting with http:// or https://");
      autoHide(setErrId);
      return;
    }
    try {
      setSaving(true);
      setMsgId(""); setErrId("");
      const payload = {
        owner: owner.trim(),
        name: name.trim(),
        description: description.trim(),
        repoUrl: repoUrl.trim() || null,
        userId,
      };
      const m = await repo.updateMeta(model.id, payload);
      onUpdated?.(m);
      setMsgId("Identity updated.");
      autoHide(setMsgId);
    } catch {
      setErrId("Update failed. Please try again.");
      autoHide(setErrId);
    } finally { setSaving(false); }
  };

  const saveMetadata = async () => {
    try {
      setSaving(true);
      setMsgMeta(""); setErrMeta("");
      const payload = { pipelineTag, library, license, languages, modelSize, dataClassification, tags, userId };
      const m = await repo.updateMeta(model.id, payload);
      onUpdated?.(m);
      setMsgMeta("Metadata updated.");
      autoHide(setMsgMeta);
    } catch {
      setErrMeta("Update failed. Please try again.");
      autoHide(setErrMeta);
    } finally { setSaving(false); }
  };


  const saveUsageLimits = async () => {
    try {
      setSaving(true);
      setMsgUse(""); setErrUse("");
      const payload = { howToUse, dataSources, intendedUse, outOfScope, systemRequirements, userId };
      const m = await repo.updateMeta(model.id, payload);
      onUpdated?.(m);
      setMsgUse("Usage & limits updated.");
      autoHide(setMsgUse);
    } catch {
      setErrUse("Update failed. Please try again.");
      autoHide(setErrUse);
    } finally { setSaving(false); }
  };

  const destroy = async () => {
    if (confirm !== model.name) return setErrUse("Type the model name to confirm deletion.");
    try {
      setSaving(true);
      await repo.deleteModel(model.id, { userId });
      onDeleted?.(model.id);
      setMsgUse("Model deleted.");
      autoHide(setMsgUse);
    } catch {
      setErrUse("Delete failed.");
      autoHide(setErrUse);
    } finally { setSaving(false); }
  };

  // local confirm (kept near danger zone)
  const [confirm, setConfirm] = useState("");

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 980 }}>

      {/* Visibility */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1"><b>Change Model Visibility</b></Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              This model is currently <b>{model.private ? "Private" : "Public"}</b>.
            </Typography>
            <RadioGroup row value={visibility} onChange={e => setVisibility(e.target.value)} sx={{ mt: 1 }}>
              <FormControlLabel value="private" control={<Radio size="small" />} label="Private" />
              <FormControlLabel value="public"  control={<Radio size="small" />} label="Public" />
            </RadioGroup>
          </Box>
          <Button variant="contained" onClick={saveVisibility} disabled={!canEdit}>Change Visibility</Button>
        </Stack>
        {/* Local banners */}
        <Stack sx={{ mt: 1 }}>
          {msgVis && <Alert severity="success" onClose={() => setMsgVis("")}>{msgVis}</Alert>}
          {errVis && <Alert severity="error" onClose={() => setErrVis("")}>{errVis}</Alert>}
        </Stack>
      </Paper>

      {/* Core identity */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}><b>Identity</b></Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField size="small" label="Owner" fullWidth sx={tallInput} value={owner} onChange={e => setOwner(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField size="small" label="Name" fullWidth sx={tallInput} value={name} onChange={e => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              size="small" label="Short description" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={description} onChange={e => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              size="small" label="GitHub / URL" fullWidth sx={tallInput}
              placeholder="https://github.com/org/repo or project site"
              value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
              type="url" inputProps={{ inputMode: "url", pattern: "https?://.*" }}
              error={!isValidUrl} helperText={!isValidUrl ? "Must start with http:// or https://" : " "}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 0 }}>
          <Button variant="contained" onClick={saveIdentity} disabled={!canEdit}>Save Identity</Button>
        </Stack>
        {/* Local banners */}
        <Stack sx={{ mt: 1 }}>
          {msgId && <Alert severity="success" onClose={() => setMsgId("")}>{msgId}</Alert>}
          {errId && <Alert severity="error" onClose={() => setErrId("")}>{errId}</Alert>}
        </Stack>
      </Paper>

      {/* Technical metadata */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}><b>Technical Metadata</b></Typography>
        <Grid container spacing={2}>
          {/* Pipeline */}
          <Grid item xs={12} md={6}>
            <TextField
              select fullWidth size="small" label="Pipeline Tag" value={pipelineTag} onChange={e => setPipelineTag(e.target.value)} sx={tallInput}
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 400 } } } }}
            >
              <MenuItem disabled value=""><em>Select a pipeline</em></MenuItem>
              {Object.entries(PIPELINE_TAG_GROUPS).map(([category, list]) => [
                <ListSubheader disableSticky sx={{ fontWeight: 700, opacity: 0.7 }} key={`h-${category}`}>{category}</ListSubheader>,
                list.map(tag => <MenuItem sx={{ pl: 3 }} key={tag} value={tag}>{tag}</MenuItem>)
              ])}
            </TextField>
          </Grid>

          {/* Library */}
          <Grid item xs={12} md={6}>
            <TextField
              select fullWidth size="small" label="Library / Framework" value={library} onChange={e => setLibrary(e.target.value)} sx={tallInput}
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 400 } } } }}
            >
              <MenuItem disabled value=""><em>Select a library / framework</em></MenuItem>
              {LIBRARIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Grid>

          {/* License */}
          <Grid item xs={12} md={6}>
            <TextField
              select fullWidth size="small" label="License" value={license} onChange={e => setLicense(e.target.value)} sx={tallInput}
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 400 } } } }}
            >
              <MenuItem disabled value=""><em>Select a license</em></MenuItem>
              {LICENSES.map(lic => <MenuItem key={lic} value={lic}>{lic}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Languages */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="languages-label">Languages</InputLabel>
              <Select
                labelId="languages-label" multiple value={languages}
                onChange={e => setLanguages(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                renderValue={(selected) =>
                Array.isArray(selected) && selected.length
                  ? selected.join(", ")
                  : "Select languages"
              }
              >
                {LANGUAGES_ALL.map(lang => (
                  <MenuItem key={lang} value={lang}>
                    <Checkbox checked={languages.indexOf(lang) > -1} />
                    <ListItemText primary={lang} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Model size & data classification */}
          <Grid item xs={12} md={6}>
            <TextField size="small" label="Model Size" placeholder="e.g., 1.3 GB or 980 MB" value={modelSize} onChange={e => setModelSize(e.target.value)} sx={tallInput} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select size="small" fullWidth label="Data Classification" value={dataClassification} onChange={e => setDataClassification(e.target.value)} sx={tallInput}>
              <MenuItem disabled value=""><em>Select a classification</em></MenuItem>
              {DATA_CLASSIFICATIONS.map(dc => <MenuItem key={dc} value={dc}>{dc}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <TextField
              size="small" fullWidth label="Add tag" placeholder="Press Enter or comma to add"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              sx={tallInput}
            />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {tags.map(t => <Chip key={t} size="small" label={t} onDelete={() => setTags(tags.filter(x => x !== t))} />)}
            </Stack>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={saveMetadata} disabled={!canEdit}>Save Metadata</Button>
        </Stack>
        {/* Local banners */}
        <Stack sx={{ mt: 1 }}>
          {msgMeta && <Alert severity="success" onClose={() => setMsgMeta("")}>{msgMeta}</Alert>}
          {errMeta && <Alert severity="error" onClose={() => setErrMeta("")}>{errMeta}</Alert>}
        </Stack>
      </Paper>

      {/* Usage & limits */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}><b>Usage & Limits</b></Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              size="small" label="How to use this model" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={howToUse} onChange={e => setHowToUse(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small" label="Where was this data sourced" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={dataSources} onChange={e => setDataSources(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small" label="Intended Use" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={intendedUse} onChange={e => setIntendedUse(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small" label="Out of Scope / Limitations" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={outOfScope} onChange={e => setOutOfScope(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small" label="System Requirements (hardware / software)" fullWidth multiline maxRows={5}
              sx={{ "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={systemRequirements} onChange={e => setSystemRequirements(e.target.value)}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={saveUsageLimits} disabled={!canEdit}>Save Usage & Limits</Button>
        </Stack>
        <Stack sx={{ mt: 1 }}>
          {msgUse && <Alert severity="success" onClose={() => setMsgUse("")}>{msgUse}</Alert>}
          {errUse && <Alert severity="error" onClose={() => setErrUse("")}>{errUse}</Alert>}
        </Stack>
      </Paper>

      {/* Danger zone */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1"><b>Delete Repository</b></Typography>
        <Typography variant="caption" color="text.secondary">
          This action cannot be undone. Type the model name (<b>{model.name}</b>) to confirm.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
          <TextField size="small" placeholder={model.name} value={confirm} onChange={e => setConfirm(e.target.value)} sx={{ width: { xs: "100%", sm: "50%" } }} />
          <Button color="error" variant="contained" onClick={destroy} disabled={!canEdit}>I understand, delete this model</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default SettingsTab;
