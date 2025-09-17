// src/pages/tools/MLModelsRepo/views/FilesTab.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, Paper, Button, Typography, List, ListItemButton,
  ListItemText, Divider, Tooltip
} from "@mui/material";
import { FileText, Plus } from "lucide-react";
import SearchBar from "../components/SearchBar";
import * as repo from "../services/repoApi";

export function FilesTab({ model, isMine, userId }) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);

  const base = model?.sourcePath || (model?.private ? `users/${userId}/models/${model?.id}` : `models/${model?.id}`);
  const prefix = `${base}/files/`;

  const reload = async () => {
    const items = await repo.listModelFilesById(model.id, { userId });
    setFiles(items);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [model?.id, model?.private, model?.sourcePath]);

  // Make a simple flat list with relative paths and basic search
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (files || [])
      .map(f => ({
        ...f,
        rel: f.name.startsWith(prefix) ? f.name.slice(prefix.length) : f.name,
      }))
      .filter(f => !q || f.rel.toLowerCase().includes(q))
      .sort((a, b) => a.rel.localeCompare(b.rel));
  }, [files, prefix, query]);

  const canContribute = Boolean(userId) && (isMine || !model.private);

  const pickFiles = () => fileInputRef.current?.click();
  const onPicked = async (e) => {
    const arr = Array.from(e.target.files || []);
    if (!arr.length) return;
    await repo.uploadModelFiles({
      id: model.id,
      files: arr,
      isPrivate: model.private,
      userId,
      sourcePath: model.sourcePath,
    });
    e.target.value = "";
    reload();
  };

  return (
    <Box>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search files…"
          sx={{ flexGrow: 1, maxWidth: 520 }}
        />
        <Tooltip title={canContribute ? "Upload files to this model" : "Sign in / need permission"}>
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={pickFiles}
              disabled={!canContribute}
            >
              Contribute
            </Button>
          </span>
        </Tooltip>
        <input ref={fileInputRef} type="file" hidden multiple onChange={onPicked} />
      </Stack>

      {/* List */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {rows.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">No files yet.</Typography>
          </Box>
        ) : (
          <>
            <List disablePadding>
              {rows.map((f) => {
                const size = f.size ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` : "";
                const name = f.rel.split("/").pop();
                const path = f.rel.includes("/") ? f.rel.replace(`/${name}`, "") : "";
                return (
                  <ListItemButton key={f.name}>
                    <FileText size={16} />
                    <ListItemText
                      sx={{ ml: 1 }}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                      primary={name}
                      secondary={[path, size].filter(Boolean).join(" • ")}
                    />
                  </ListItemButton>
                );
              })}
            </List>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length} file{rows.length !== 1 ? "s" : ""}{query ? " (filtered)" : ""}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default FilesTab;