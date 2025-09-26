import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookTwoToneIcon from "@mui/icons-material/MenuBookTwoTone";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as repo from "../services/repoApi";
import { mdComponents } from "./mdComponents";
import CreateReadme from "./CreateReadme";

export default function ModelDetail({ model, userId, isMine }) {
  const [md, setMd] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [manifest, setManifest] = useState(null);
  const [loadingManifest, setLoadingManifest] = useState(true);

  const canEdit = useMemo(() => Boolean(userId) && Boolean(isMine), [userId, isMine]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const text = await repo.getReadme(model.id, { userId });
      setMd(text || "");
    } catch {
      setMd("");
    } finally {
      setLoading(false);
    }
  }, [model.id, userId]);

  const loadManifest = useCallback(async () => {
    try {
      setLoadingManifest(true);
      const m = await repo.getManifest(model.id, { userId });
      setManifest(m);
    } catch {
      setManifest(null);
    } finally {
      setLoadingManifest(false);
    }
  }, [model.id, userId]);

  useEffect(() => {
    load();
    loadManifest();
  }, [load, loadManifest]);

  const handleSaved = async () => {
    await load();
    setOpenEditor(false);
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      {/* Left side: README */}
      <Paper sx={{ p: 2,flex: "1 1 75%", maxWidth: "75%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <MenuBookTwoToneIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
              README
            </Typography>
          </Stack>

          {canEdit && (
            <Tooltip title={md ? "Edit README" : "Create README"}>
              <IconButton size="small" onClick={() => setOpenEditor(true)}>
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Box sx={{ mt: 1 }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          ) : md ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {md}
            </ReactMarkdown>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No README yet.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Right side: Manifest info */}
      <Paper
        sx={{
          border: "1px solid",
          p: 2,
          minWidth: 280,
          maxWidth: "25%",
          height: "fit-content",
          position: "sticky",
          top: 16,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Summary
        </Typography>
        {loadingManifest && <CircularProgress size={20} />}
        {!loadingManifest && manifest ? (
          <Stack spacing={1.5}>
            <Typography variant="body2"><b>Owner:</b> {manifest.owner}</Typography>
            <Typography variant="body2"><b>Title:</b> {manifest.name}</Typography>
            <Typography variant="body2"><b>Description:</b> {manifest.description}</Typography>
            <Typography variant="body2"><b>How To Use:</b> {manifest.howToUse}</Typography>
            <Typography variant="body2"><b>Data Sources:</b> {manifest.dataSources}</Typography>
            <Typography variant="body2"><b>Intended Use:</b> {manifest.intendedUse}</Typography>
            <Typography variant="body2"><b>Out of Scope:</b> {manifest.outOfScope}</Typography>
            <Typography variant="body2"><b>System Requirements:</b> {manifest.systemRequirements}</Typography>
            <Typography variant="body2"><b>Pipeline:</b> {manifest.pipelineTag}</Typography>
            <Typography variant="body2"><b>Library:</b> {manifest.library}</Typography>
            <Typography variant="body2">
              <b>Languages:</b> {Array.isArray(manifest.languages) ? manifest.languages.join(", ") : manifest.languages}
            </Typography>
            <Typography variant="body2"><b>License:</b> {manifest.license}</Typography>
            <Typography variant="body2"><b>Model Size:</b> {manifest.modelSize}</Typography>
            <Typography variant="body2"><b>Data Classification:</b> {manifest.dataClassification}</Typography>
            <Typography variant="body2"><b>Tags:</b> {manifest.tags}</Typography>
            <Typography variant="body2"><b>Repo Url:</b> {manifest.repoUrl}</Typography>
            <Typography variant="body2"><b>Last Updated:</b> {new Date(manifest.updatedAt).toLocaleString()}</Typography>

          </Stack>
        ) : (
          !loadingManifest && <Typography variant="body2" color="text.secondary">No manifest available.</Typography>
        )}
      </Paper>

      {/* README Editor Dialog */}
      <Dialog
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { height: { xs: "92vh", md: "84vh" }, backgroundColor: "#f5f5f5" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {md ? "Edit README" : "Create README"} — <b>{model?.id}</b>
          <IconButton onClick={() => setOpenEditor(false)} sx={{ ml: "auto" }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <CreateReadme modelId={model.id} userId={userId} onSaved={handleSaved} />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
