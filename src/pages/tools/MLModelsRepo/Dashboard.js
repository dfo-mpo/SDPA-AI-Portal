/**
 * ML Model Repository Dashboard
 *
 * Core component for the ML Model Repository tool, which enables users to
 * manage, explore, and interact with machine learning models. This component
 * provides the user interface for browsing available models, viewing model
 * metadata, uploading new models, and monitoring usage statistics.
 */

import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Button, Stack, Alert, AlertTitle, Paper } from "@mui/material";
import { ToolPage } from "../../../components/tools";
import { useLanguage } from "../../../contexts";
import { getToolTranslations } from "../../../utils";
import { useMsal } from "@azure/msal-react"; 

// views
import ModelsList from "./views/ModelsList";
import UploadsList from "./views/UploadsList";
import ModelDetail from "./views/ModelDetail";
import CreateModel from "./views/CreateModel";
import FilesTab from "./views/FilesTab";         // NEW
import SettingsTab from "./views/SettingsTab";   // NEW
import CreateReadme from "./views/CreateReadme"  // NEW
import * as repo from "./services/repoApi";

const VIEW = {
  MODELS: "models",
  UPLOADS: "uploads",
  DETAIL: "detail",
  CREATE: "create",
};

export function MLModelsRepo() {
  const { language } = useLanguage();
  const t = getToolTranslations("mlModelsRepo", language);
  const { accounts } = useMsal();
  const userId = accounts?.[0]?.idTokenClaims?.oid          // preferred stable id
                || accounts?.[0]?.username
                || accounts?.[0]?.homeAccountId
                || null;

  // global page state
  const [view, setView] = useState(VIEW.MODELS);
  const [lastListTab, setLastListTab] = useState(0); // 0=models, 1=uploads (remember which tab)
  const [models, setModels] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [pendingReadmeId, setPendingReadmeId] = useState(null);

  // detail sub-tabs: 0 = Overview, 1 = Files, 2 = Settings (only if mine)
  const [detailTab, setDetailTab] = useState(0);
  const [isMine, setIsMine] = useState(false);

  // load data (replace with Azure later)
  const reload = async () => {
    const [m, u] = await Promise.all([repo.listModels(), repo.listUploads(userId)]);
    setModels(m);
    setUploads(u);
  };
  useEffect(() => { reload(); }, [userId]);

  // Tabs control (only two tabs: Models / My Uploads)
  const tabValue = lastListTab;
  const handleTab = (_e, v) => {
    setLastListTab(v);
    setSelectedModel(null);
    setView(v === 0 ? VIEW.MODELS : VIEW.UPLOADS);
  };

  // handlers to move between views
  const openModel = async (id, fromUploads = false) => {
    const model = await repo.getModel(id, { userId: fromUploads ? userId : undefined }); // <-- pass only if needed
    setSelectedModel(model);
    setIsMine(fromUploads || uploads.some((u) => u.id === id));
    setDetailTab(0); // land on Overview
    setView(VIEW.DETAIL);
    setLastListTab(fromUploads ? 1 : 0);
  };

  const backToList = () => {
    setView(lastListTab === 0 ? VIEW.MODELS : VIEW.UPLOADS);
    setSelectedModel(null);
  };

  const onCreateClick = () => {
    setLastListTab(1);
    setPendingReadmeId(null);
    setView(VIEW.CREATE);
  };

  const onCreated = async (newId) => {
    const [m, u] = await Promise.all([repo.listModels(), repo.listUploads(userId)]);
    setModels(m);
    setUploads(u);
    setPendingReadmeId(newId);
    setView(VIEW.CREATE);
    // 
  };

  const onReadmeSaved = async (id) => {
    await reload();
    setPendingReadmeId(null);
    openModel(id, true);
  }

  // Update selected model after settings change
  const onSettingsUpdated = (updated) => {
    setSelectedModel(updated);
    // also reflect in local lists
    setModels((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    setUploads((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
  };

  const upsert = (list, m) =>
  list.some(x => x.id === m.id)
    ? list.map(x => (x.id === m.id ? { ...x, ...m } : x))
    : [...list, m];

  const handleSettingsUpdated = (updated) => {
    setSelectedModel(updated);

    // keep both lists in sync immediately
    if (updated.private) {
      // now private → remove from public Models, keep/add in My Uploads
      setModels(prev => prev.filter(x => x.id !== updated.id));
      setUploads(prev => upsert(prev, updated));
    } else {
      // now public → ensure in Models, keep/add pointer in My Uploads
      setModels(prev => upsert(prev, updated));
      setUploads(prev => upsert(prev, updated));
    }

    // optional: background truth refresh (won't flicker)
    reload();
  };

  const handleModelDeleted = (deletedId) => {
    setSelectedModel(null);
    setModels(prev => prev.filter(x => x.id !== deletedId));
    setUploads(prev => prev.filter(x => x.id !== deletedId));
    setView(VIEW.UPLOADS);
    // optional: reload();
  };

  const showListTabs = view === VIEW.MODELS || view === VIEW.UPLOADS || view === VIEW.CREATE;
  const showDetailTabs = view === VIEW.DETAIL && selectedModel;

  // Clamp detailTab if not mine (hide Settings)
  const effectiveDetailTab = isMine ? detailTab : Math.min(detailTab, 1);

  return (
    <Paper sx={{
        p: { xs: 1, sm: 1, md: 2 },
        mx: "auto",
        my: 2,
        maxWidth: 1320,
        borderRadius: 3,
      }}>
      <Stack sx={{mb: 1}}>
        <p style={{ fontSize: 50, fontWeight: 600, marginTop: 30 }}>
          ML Models Repository
        </p>
        <p style={{ fontSize: 20, marginTop: 0 }}>
          Explore and Upload ML Models
        </p>
        <p style={{ marginTop: 60 }}>
          A unified repository where users can upload, explore, and manage machine learning models. It supports versioning, model cards with key metadata, and provides SDK-ready examples in Python, R, and REST to help teams quickly integrate models into their workflows. Users can browse existing models from OCDS and SDPA or contribute their own, with support for common formats like ONNX, TorchScript, and scikit-learn.
        </p>
      </Stack>
      {/* Disclaimer banner */}
      <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>Disclaimer</AlertTitle>
        This hub is for <strong>demonstration purposes only</strong> and is <strong>not</strong> an enterprise solution.
        Upload and publish <strong>only unclassified/unprotected information</strong>: both models and their training data
        must be unclassified or publicly available. <strong>Do not</strong> upload protected, sensitive, or classified data.
        Content here is intended for collaborative exploration and documentation with <strong>no production guarantees</strong>.
        By proceeding, you confirm you have the right to share the materials and agree to comply with these boundaries.
      </Alert>
      
      {/* Top rail */}
      <Stack direction="row" alignItems="center" sx={{ width: "100%", mb: 2 }}>
        {showListTabs && (
          <Tabs value={tabValue} onChange={handleTab} sx={{ minHeight: 48 }}>
            <Tab label={t.ui?.sections?.models || "Models"} sx={{ minHeight: 48 }} />
            <Tab label={t.ui?.sections?.uploads || "My Uploads"} sx={{ minHeight: 48 }} />
          </Tabs>
        )}

        {showDetailTabs && (
          <Tabs
            value={effectiveDetailTab}
            onChange={(_e, v) => setDetailTab(v)}
            sx={{ minHeight: 48 }}
          >
            <Tab label="Overview" sx={{ minHeight: 48 }} />
            <Tab label="Files" sx={{ minHeight: 48 }} />
            {isMine && <Tab label="Settings" sx={{ minHeight: 48 }} />}
          </Tabs>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {view === VIEW.DETAIL && (
          <Button variant="text" onClick={backToList}>
            ← Back
          </Button>
        )}
      </Stack>

      {/* Views */}
      {view === VIEW.MODELS && <ModelsList rows={models} onOpenModel={openModel} />}

      {view === VIEW.UPLOADS && (
        <UploadsList rows={uploads} onOpenModel={(id) => openModel(id, true)} onCreateClick={onCreateClick} />
      )}

      {view === VIEW.DETAIL && selectedModel && (
        <>
          {effectiveDetailTab === 0 && <ModelDetail model={selectedModel} isMine={isMine} userId={userId}/>}
          {effectiveDetailTab === 1 && <FilesTab model={selectedModel} isMine={isMine} userId={userId}/>}
          {isMine && effectiveDetailTab === 2 && (
            <SettingsTab model={selectedModel} isMine={isMine} userId={userId} onUpdated={handleSettingsUpdated} onDeleted={handleModelDeleted}/>
          )}
        </>
      )}

      {view === VIEW.CREATE && (
        pendingReadmeId 
        ? <CreateReadme modelId={pendingReadmeId} userId={userId} onSaved={() => onReadmeSaved(pendingReadmeId)} />
        : 
        <CreateModel userId={userId} onCancel={backToList} onCreated={onCreated} />)}
    </Paper>
  );
}


export default MLModelsRepo;