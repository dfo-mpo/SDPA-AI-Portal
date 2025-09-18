// src/pages/tools/MLModelsRepo/views/CreateReadme.js
import React, { useEffect, useRef, useState } from "react";
import { Box, Stack, Paper, Button, Switch, FormControlLabel, Typography, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as repo from "../services/repoApi";
import { mdComponents } from "./mdComponents";

export default function CreateReadme({ modelId, userId, onSaved }) {
  const [md, setMd] = useState(`# ${modelId}\n\nDescribe your model here. Use **Markdown**.\n`);
  const [split, setSplit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const taRef = useRef(null);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [md]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    await repo.saveReadme(modelId, { markdown: md, userId });
    setSaving(false);
    setDirty(false);
    onSaved?.(modelId);
  };

  const Editor = (
    <Box sx={{
      p: 0, height: "100%", display: "flex", flexDirection: "column",
      "& textarea": {
        flex: 1, width: "100%", resize: "none", outline: "none", border: "none",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        fontSize: 14, lineHeight: 1.6, padding: 2,
        background: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
        borderRadius: 1
      }
    }}>
      <textarea
        ref={taRef}
        value={md}
        onChange={(e) => { setMd(e.target.value); setDirty(true); }}
        placeholder="Write your README in Markdown…"
        rows={18}
      />
    </Box>
  );

  const Preview = (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {md}
      </ReactMarkdown>
    </Box>
  );

  return (
    <Stack spacing={1} sx={{ height: "100%", width: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" sx={{ mr: 2 }}>README for <b>{modelId}</b></Typography>
        <FormControlLabel
          control={<Switch checked={split} onChange={(e) => setSplit(e.target.checked)} />}
          label="Split view"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={onSave}
          startIcon={saving ? <CircularProgress size={14} /> : null}
          disabled={saving}
        >
          {saving ? "Saving…" : dirty ? "Save README" : "Saved"}
        </Button>
      </Stack>

      {split ? (
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ flex: 1 }}>
          <Paper variant="outlined" sx={{ flex: 1, overflow: "hidden" }}>{Editor}</Paper>
          <Paper variant="outlined" sx={{ flex: 1, overflow: "hidden" }}>{Preview}</Paper>
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ flex: 1, overflow: "hidden" }}>{Editor}</Paper>
      )}
    </Stack>
  );
}
