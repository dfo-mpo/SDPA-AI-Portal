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
  Chip
} from "@mui/material";
import { Boxes, History, BookOpen } from "lucide-react";
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
          A unified repository where users can upload, explore, and manage machine learning models. It supports versioning, model cards with key metadata, and provides SDK-ready examples in Python, R, and REST to help teams quickly integrate models into their workflows. Users can browse existing models from OCDS and SDPA or contribute their own, with support for common formats like ONNX, TorchScript, and scikit-learn.
        </p>
      </Stack>

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
                  backgroundColor: "white",
                },
              }}
            >
              <DialogTitle
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "white",
                }}
              >
                <BookOpen size={25} style={{ marginRight: 8 }}/>
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
                sx={{
                  p: 2,
                  backgroundColor: "white",
                }}
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
    </Paper>
  );
}

export default MLModelsRepo;