/**
 * ML Model Repository Dashboard
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  Alert,
  AlertTitle,
  Paper,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Drawer,
  Button,
  Divider
} from "@mui/material";
import { Boxes, History, BookOpen, HelpCircle, FileText, Download, Search } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useLanguage } from "../../../contexts";
import { getToolTranslations } from "../../../utils";
import ModelsList from "./views/ModelsList";
import ModelDetail from "./views/ModelDetail";
import * as modelsApi from "./services/repoApi";

// Main Dashboard
export function MLModelsRepo() {
  const { language } = useLanguage();
  const t = getToolTranslations("mlModelsRepo", language);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);
  const [tab, setTab] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { items } = await modelsApi.listModels();
      setItems(items);
    } catch (e) {
      const msg =
        e?.response?.data?.detail?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to load models.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = (row) => {
    setSelectedModel(row);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
  };

  const handleHistory = async (item) => {
    setLoading(true);
    setErr("");
    try {
      const { items } = await modelsApi.listModelVersions(item.name);
      setItems(items);
      setHistoryFor(item.name);
      setTab(1);
    } catch (e) {
      const msg =
        e?.response?.data?.detail?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to load model versions.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    // 0 = Models, 1 = Version history
    if (newValue === 0) {
      setHistoryFor(null);
      load();
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 1, md: 2 },
        mx: "auto",
        my: 2,
        maxWidth: 1320,
        borderRadius: 3,
        bgcolor: (theme) => theme.palette.background.paper,
      }}
    >
      {/* Header / Hero */}
      <Stack sx={{ mb: 1 }}>
        <p style={{ fontSize: 50, fontWeight: 600, marginTop: 30 }}>
          ML Models Repository
        </p>
        <p style={{ fontSize: 20, marginTop: 0 }}>
          Explore and Upload ML Models
        </p>
        <p style={{ marginTop: 30 }}>
          A unified repository where users can upload, explore, and manage machine learning models. It supports versioning and model cards with key metadata to help teams quickly integrate models into their workflows. Users can browse existing models from OCDS and SDPA or contribute their own.
        </p>
      </Stack>

      <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
        <AlertTitle>Model Source & Access</AlertTitle>
        All models are sourced from <strong>DFO Azure AML</strong>.
        <br />
        To upload your AI models onto AML and to have access, please contact{" "}
        <a
          href="mailto:OCDS-DFO.OCDS-BIPD.MPO@dfo-mpo.gc.ca"
          style={{ fontWeight: 600 }}
        >
          OCDS - DFO.OCDS-BIPD.MPO@dfo-mpo.gc.ca
        </a>.
      </Alert>

      <br></br>

      {/* Disclaimer */}
      <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>Disclaimer</AlertTitle>
        This hub is for <strong>demonstration purposes only</strong> and is <strong>not</strong> an enterprise solution.
        Upload and publish <strong>only unclassified/unprotected information</strong>: both models and their training data
        must be unclassified or publicly available. <strong>Do not</strong> upload protected, sensitive, or classified data.
        Content here is intended for collaborative exploration and documentation with <strong>no production guarantees</strong>.
        By proceeding, you confirm you have the right to share the materials and agree to comply with these boundaries.
      </Alert>

      {/* Tabs: Models + Version history */}
      <Stack direction="row" alignItems="center" sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ minHeight: 48 }}
        >
          {/* Models tab */}
          <Tab
            icon={<Boxes size={16} />}
            iconPosition="start"
            label={t?.ui?.sections?.models || "Models"}
            sx={{ minHeight: 48 }}
          />

          {/* Version history tab (only when active) */}
          {historyFor && (
            <Tab
              icon={<History size={16} />}
              iconPosition="start"
              label={`Version history`}
              sx={{ minHeight: 48 }}
            />
          )}
        </Tabs>
        <Box sx={{ flexGrow: 1 }} />
      </Stack>

      {tab === 1 && historyFor && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.7, p: 1 }}>
            Viewing history for:
          </Typography>
          <Chip
            label={historyFor}
            color="primary"
            size="large"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      )}

      {/* Content */}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {/* grid of cards */}
          <ModelsList
            rows={items}
            onSelect={handleSelect}
            onHistory={handleHistory}
            showSearch={tab === 0}
          />

          {/* README dialog */}
          {selectedModel && (
            <Dialog
              open={detailOpen}
              onClose={handleCloseDetail}
              fullWidth
              maxWidth="md"
              PaperProps={{
                sx: {
                  bgcolor: (theme) => theme.palette.background.paper,
                },
              }}
            >
              <DialogTitle
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.default
                      : theme.palette.common.white,
                })}
              >
                <BookOpen size={25} style={{ marginRight: 8 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedModel.name} (v{selectedModel.version}) - README
                </Typography>
                <IconButton
                  onClick={handleCloseDetail}
                  size="small"
                  sx={{ ml: "auto" }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent
                dividers
                sx={(theme) => ({
                  p: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.default
                      : theme.palette.common.white,
                })}
              >
                <ModelDetail
                  name={selectedModel.name}
                  version={selectedModel.version}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {/* Tiny right-edge arrow tab */}
      <Button
        onClick={() => setHelpOpen(true)}
        variant="contained"
        sx={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          minWidth: 0,
          width: 36,
          height: 48,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          p: 0,
          fontWeight: 800,
        }}
        aria-label="Open instructions"
        title="Open instructions"
      >
        <HelpCircle size={18} />
      </Button>

      <Drawer
        anchor="right"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        PaperProps={{
            sx: {
              width: 380,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.grey[50],
            },
          }}
        >
        <Box sx={{ p: 2.5 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              How this page works
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 1. Browse & use existing models */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            1. Use existing models
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
            This page is for <b>discovering and using</b> models that have already
            been registered in the repository.  
            <br />
            <br />
            You can:
          </Typography>

          {/* Bullets with icons + spacing */}
          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              •
              <Search size={16} />
              <span>
                <b>Search</b> by model name or tags using the search bar.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              •
              <FileText size={16} />
              <span>
                Open the <b>README</b> to view details, usage, and documentation.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              •
              <History size={16} />
              <span>
                Click <b>Version history</b> to browse other versions of the same model.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              •
              <Download size={16} />
              <span>
                Click <b>Download</b> to retrieve model weights / artifacts as a ZIP file.
              </span>
            </Typography>
          </Stack>


          <Divider sx={{ my: 3 }} />

          {/* 2. Contribute a new model */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            2. Contribute a new model
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            You <b>cannot upload models directly</b> from this page.
            <br />
            To register a new model or a new version, please contact{" "}
            <strong>OCDS - DFO.OCDS-BIPD.MPO@dfo-mpo.gc.ca</strong>.
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1.5, fontSize: 12, lineHeight: 1.6 }}
          >
            Once a model is successfully registered there, it will appear in this
            list with its tags, flavors, and metadata.
          </Typography>
        </Box>
      </Drawer>
    </Paper>
  );
}

export default MLModelsRepo;