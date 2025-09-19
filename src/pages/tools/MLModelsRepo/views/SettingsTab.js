import React, { useState } from "react";
import { Box, Paper, Stack, Typography, Button, TextField, Divider, Alert, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import * as repo from "../services/repoApi";

export function SettingsTab({ model, userId, onUpdated, onDeleted }) {
  const [visibility, setVisibility] = useState(model.private ? "private" : "public");
  const [owner, setOwner] = useState(model.owner || "");
  const [name, setName] = useState(model.name || "");
  const [description, setDescription] = useState(model.description || "");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const isMine = !!userId;
  const canEdit = Boolean(userId) && Boolean(isMine) && !saving;

  const saveVisibility = async () => {
    try {
      setSaving(true);
      const m = await repo.updateVisibility(model.id, { visibility, userId });
      onUpdated?.(m);
      setMsg("Visibility updated.");
    } finally { setSaving(false); }
  };

  const saveMeta = async () => {
    try {
      setSaving(true);
      const m = await repo.updateMeta(model.id, { name, owner, description, userId });
      onUpdated?.(m);
      setMsg("Model details updated.");
    } finally { setSaving(false); }
  };

  const destroy = async () => {
    if (confirm !== model.name) return setMsg("Type the model name to confirm deletion.");
    try {
      await repo.deleteModel(model.id, { userId });
      onDeleted?.(model.id);
      setMsg("Model deleted.");
    } finally { setSaving(false); }
  };

  const tallInput = {
    "& .MuiOutlinedInput-root": { height: 50 },            
    "& .MuiOutlinedInput-input": { py: 1.25 }              
  };

  return (
    <Stack spacing={2} sx={{width: "50%", minWidth: "400px"}} >
      {msg && <Alert severity="success" onClose={() => setMsg("")}>{msg}</Alert>}

      {/* Visibility */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1">Change Model Visibility</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              This model is currently <b>{model.private ? "Private" : "Public"}</b>.
            </Typography>
            <RadioGroup row value={visibility} onChange={e => setVisibility(e.target.value)} sx={{ mt: 1 }}>
              <FormControlLabel value="private" control={<Radio size="small" />} label="Private" />
              <FormControlLabel value="public"  control={<Radio size="small" />} label="Public" />
            </RadioGroup>
          </Box>
          <Button variant="outlined" onClick={saveVisibility} disabled={!canEdit}>Change</Button>
        </Stack>
      </Paper>

      {/* Meta */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Rename or Transfer Ownership</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
              <TextField size="small" label="New Owner" sx={tallInput} value={owner} onChange={e => setOwner(e.target.value)} />
              <TextField size="small" label="New Name"  sx={tallInput} value={name}  onChange={e => setName(e.target.value)} />
            </Stack>
            <TextField
              size="small" label="Short description" fullWidth multiline maxRows={5}
              sx={{ mt: 2, "& .MuiOutlinedInput-root": { height: 120, alignItems: "flex-start" } }}
              value={description} onChange={e => setDescription(e.target.value)}
            />
          </Box>
          <Button variant="outlined" onClick={saveMeta} disabled={!canEdit}>Change</Button>
        </Stack>
      </Paper>

      {/* Danger zone */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1">Delete Repository</Typography>
        <Typography variant="caption" color="text.secondary">
          This action cannot be undone. Type the model name (<b>{model.name}</b>) to confirm.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
          <TextField size="small" placeholder={model.name} value={confirm} onChange={e => setConfirm(e.target.value)} sx={{width: "50%"}}/>
          <Button color="error" variant="contained" onClick={destroy} disabled={!canEdit}>I understand, delete this model</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default SettingsTab;