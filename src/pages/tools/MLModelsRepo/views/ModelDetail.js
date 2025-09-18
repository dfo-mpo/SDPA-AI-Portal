// src/pages/tools/MLModelsRepo/views/ModelDetail.js
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookTwoToneIcon from "@mui/icons-material/MenuBookTwoTone"; // book icon
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";       // pencil
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as repo from "../services/repoApi";
import { mdComponents } from "./mdComponents";
import CreateReadme from "./CreateReadme";

// NOTE: we rely ONLY on isMine + userId (same idea as SettingsTab)
export default function ModelDetail({ model, userId, isMine }) {
  const [md, setMd] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Same permission idea as SettingsTab: can edit iff authenticated AND it's mine
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

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = async () => {
    await load();         // refresh after save
    setOpenEditor(false); // close popup
  };

  return (
    <>
      <Paper sx={{ p: 2, width: "100%" }}>
        {/* Header: book icon + label (left), pencil (right if canEdit) */}
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

        {/* Content (no divider) */}
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

      {/* Editor dialog (same CreateReadme UI) */}
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
    </>
  );
}
