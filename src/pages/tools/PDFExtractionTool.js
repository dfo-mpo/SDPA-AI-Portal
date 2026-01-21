/**
 * PDF Extraction Tool
 */

import React, { useState, useEffect} from "react";
import {
  Paper, Stack, Alert, AlertTitle, TextField, Button, Drawer, Divider,
  Typography, Box, Stepper, Step, StepLabel, LinearProgress, Collapse, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress 
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Upload,
  FileText,
  Download,
  Table as TableIcon,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { useToolSettings } from "../../contexts";

// const API_BASE = "http://localhost:8000";
const API_BASE = "/api";

export function PDFExtractionTool() {
  /* Hooks */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const fileKey = (f) => `${f.name}::${f.size}::${f.lastModified || 0}`;
  const [previews, setPreviews] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState("");
  const [pdfStatus, setPdfStatus] = useState(null);
  const [schemaStatus, setSchemaStatus] = useState(null);
  const [presetStatus, setPresetStatus] = useState(null);
  const [manualStatus, setManualStatus] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState(null);
  const [resultsByDoc, setResultsByDoc] = useState({});
  const [vstoreId, setVstoreId] = useState(null);
  const [docNames, setDocNames] = useState([]);
  const [indexing, setIndexing] = useState(false);
  const selectedDocName = docNames[currentIdx] || null;
  const visibleRows = selectedDocName && resultsByDoc[selectedDocName]
    ? resultsByDoc[selectedDocName]
    : [];
  const [fieldMode, setFieldMode] = useState(null);
  const { PDFExtractionToolSettings } = useToolSettings();
  const selectedModel = PDFExtractionToolSettings?.modelType || "gpt4omini";

  /* Functions */
  function handleFileInput(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    const map = new Map(files.map((f) => [fileKey(f), f]));
    let added = 0;
    for (const f of picked) { if (!map.has(fileKey(f))) added++; map.set(fileKey(f), f); }
    const next = Array.from(map.values());
    setFiles(next);
    e.target.value = "";
    setPdfStatus(
      added
        ? { type: "success", msg: `${next.length} uploaded` }
        : { type: "info", msg: `${next.length} uploaded (no new; duplicates ignored)` }
    );
  }

  function removeFileAt(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSchemaUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      let incoming = [];
      const lower = f.name.toLowerCase();
      if (lower.endsWith(".csv")) {
        const first = (text.split(/\r?\n/)[0] || "").split(",");
        incoming = first.map((h) => h.trim()).filter(Boolean);
      } else if (lower.endsWith(".json")) {
        const obj = JSON.parse(text);
        if (Array.isArray(obj) && obj[0] && typeof obj[0] === "object") {
          incoming = Object.keys(obj[0] || {});
        } else if (obj && typeof obj === "object") {
          incoming = Object.keys(obj);
        }
      }
      if (incoming.length) {
        const seen = new Set(fields.map((x)=>x.toLowerCase().trim()));
        const unique = incoming.filter((x)=>!seen.has(x.toLowerCase().trim()));
        setFields((prev)=>[...prev, ...unique]);
        setSchemaStatus({
          type: "success",
          msg: `Schema loaded: ${incoming.length} field${incoming.length>1?"s":""} (${unique.length} new).`
        });
      } else {
        setSchemaStatus({ type: "info", msg: "No fields detected in schema." });
      }
    } catch {
      setSchemaStatus({ type: "error", msg: "Failed to parse schema. Check file format." });
    } finally {
      e.target.value = "";
    }
  }

  function addField() {
    const v = (newField || "").trim();
    if (!v) return;
    const exists = fields.some((x) => x.toLowerCase().trim() === v.toLowerCase());
    if (exists) setManualStatus({ type: "info", msg: `Field “${v}” already exists.` });
    else { setFields((prev)=>[...prev, v]); setManualStatus({ type: "success", msg: `Added field: “${v}”.` }); }
    setNewField("");
  }

  function clearFields() {
    if (!fields.length) { setManualStatus({ type: "info", msg: "No fields to clear." }); return; }
    setFields([]);
    setManualStatus({ type: "success", msg: "All fields cleared." });
  }

  function toCsv(rows) {
    const header = ["Field","Answer","Source","Reasoning"];
    const escape = (v="") =>
      `"${String(v).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const lines = [header.map(escape).join(",")].concat(
      rows.map(r => [r.field, r.answer, r.source, r.reasoning].map(escape).join(","))
    );
    return lines.join("\n");
  }

  function download(filename, text, mime="text/plain") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  async function indexPdfs() {
    if (vstoreId) return { vectorstore_id: vstoreId, processed_files: docNames };
    if (!files.length) {
      setPdfStatus({ type: "info", msg: "Add at least one PDF first." });
      return;
    }

    setIndexing(true);
    setExtractionStatus({ type: "info", msg: "Indexing PDFs…" });

    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));

      const r = await fetch(`${API_BASE}/api/index`, { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();

      setVstoreId(data.vectorstore_id || null);
      setDocNames(data.processed_files || []);
      setActiveStep(1);
      openSection("fields");
      return data;
    } catch (e) {
      setPdfStatus({ type: "error", msg: readHttpError(e) });
      return null;
    } finally {
      setIndexing(false);
    }
  }

  async function handleExtract() {
    if (!fields.length) {
      setExtractionStatus({ type: "info", msg: "Add at least one field before extracting." });
      return;
    }

    let vsId = vstoreId;
    let docs = docNames;

    if (!vsId || !docs.length) {
      const data = await indexPdfs();
      if (!data) return;
      vsId = data.vectorstore_id;
      docs = data.processed_files || [];
    }

    if (!vsId || !docs.length) {
      setExtractionStatus({ type: "error", msg: "No processed documents available to extract from." });
      return;
    }

    setExtracting(true);
    setExtractionStatus({ type: "info", msg: "Extracting…" });
    try {
      const res = await fetch(`${API_BASE}/api/extract_per_file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vectorstore_id: vsId, fields, document_names: docs, model_type: selectedModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const grouped = {};
      for (const r of (data.results || [])) {
        const key = r.document || "(Unknown)";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      }

      setResultsByDoc(grouped);
      setResultsOpen(true);
      openSection("results");
      setActiveStep(3);

      const docCount = Object.keys(grouped).length;
      setExtractionStatus({
        type: "success",
        msg: `Extraction complete from ${docCount} document${docCount === 1 ? "" : "s"}.`,
      });
    } catch (e) {
      setExtractionStatus({ type: "error", msg: `Extraction failed: ${readHttpError(e)}` });
    } finally {
      setExtracting(false);
    }
  }

  function readHttpError(e) {
    try {
      const obj = JSON.parse(e.message || "{}");
      return obj?.detail || e.message || "Request failed";
    } catch {
      return e.message || "Request failed";
    }
  }

  function openSection(which) {
    setUploadOpen(which === "upload");
    setFieldsOpen(which === "fields");
    setResultsOpen(which === "results");
  }

  function toggleSection(which) {
    if (which === "upload") {
      setUploadOpen((v) => !v);
    } else if (which === "fields") {
      // only allow opening if step unlockedd
      if (!fieldsOpen && activeStep < 1) return;
      setFieldsOpen((v) => !v);
    } else if (which === "results") {
      // Only allow opening if step unlockedd
      if (!resultsOpen && activeStep < 2) return;
      setResultsOpen((v) => !v);
    }
  }

  useEffect(() => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  useEffect(() => {
    if (files.length > 0 && activeStep === 0) {
      setActiveStep(1);
      openSection("fields");
    }
  }, [files.length]);

  /* UI */
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
        <Stack sx={{ mb: 1 }}>
          <p style={{ fontSize: 50, fontWeight: 600, marginTop: 30 }}>PDF Extraction Tool</p>
          <p style={{ fontSize: 20, marginTop: 0 }}>
            Extract data from any public PDF
          </p>
          <p style={{ marginTop: 20 }}>
            This tool allows users to upload a PDF and automatically scrape its contents for
            structured data extraction. Once scraped, users can ask questions about the PDF using
            OpenAI-powered analysis. Ideal for quick insights, research, or prototyping, this tool
            simplifies the process of turning raw PDF content into actionable answers.
          </p>
        </Stack>

        {/* Disclaimer banner */}
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Disclaimer</AlertTitle>
          This tool is for <strong>demonstration purposes only</strong> and is{" "}
          <strong>not</strong> an enterprise solution. Use only{" "}
          <strong>publicly accessible PDFs</strong> and avoid uploading protected, sensitive, or
          classified content. The tool is intended for educational and exploratory use with{" "}
          <strong>no production guarantees</strong>. By proceeding, you confirm you have the right to access and analyze the content you provide.
        </Alert>

        <Box sx={{ mt: 4 }} />

        {/* Visual Step Guide */}
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {["Upload PDF", "Add Field Questions", "View Results"].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {(indexing || extracting) && <LinearProgress sx={{ mt: 1 }} />}
        </Box>

      {/* Upload PDF(s) Section */}
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box
          onClick={() => toggleSection("upload")}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.2,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[100],
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.grey[600]
                  : theme.palette.grey[200],
            },
          }}
        >
          <Typography variant="h4" fontWeight={700}>Upload PDF(s)</Typography>
          {uploadOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Box>

        <Collapse in={uploadOpen} timeout="auto" unmountOnExit>
          {/* Upload PDF button */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button variant="contained" component="label" size="small" sx={{ textTransform: "none" }}>
              Select PDF(s)
              <input
                hidden
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileInput}
              />
            </Button>

            {/* Preview selector when multiple PDFs */}
            {files.length > 1 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">Preview:</Typography>
                <select
                  value={currentIdx}
                  onChange={(e) => setCurrentIdx(Number(e.target.value))}
                  style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc" }}
                >
                  {files.map((f, i) => (
                    <option key={i} value={i}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </Box>
            )}
          </Box>

          {/* file count */}
          {files.length > 0 && (
            <Typography variant="caption" sx={{ display: "block", mt: 1, ml: 0.5, color: "text.secondary" }}>
              {files.length} file(s) selected.
            </Typography>
          )}

          {/* file names */}
          {files.length > 0 && (
            <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {files.map((f, i) => (
                <Chip
                  key={fileKey(f)}
                  label={f.name}
                  onDelete={() => removeFileAt(i)}
                  deleteIcon={
                    <Box component="span" sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
                      ×
                    </Box>
                  }
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    "& .MuiChip-label": {
                      maxWidth: 320,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    },
                    "& .MuiChip-deleteIcon": { fontSize: 20 },
                  }}
                />
              ))}
            </Box>
          )}
          
          {/* PDF viewer */}
          <Box sx={{ mt: 2 }}>
            {previews.length > 0 ? (
              <iframe
                title="pdf-viewer"
                src={previews[currentIdx]}
                width="100%"
                height="640"
                style={{ border: "1px solid #ddd", borderRadius: 8 }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Select one or more PDFs to preview them here.
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* PDF Upload Alert Status (Success, info or faiilure) */}
      {pdfStatus && (
        <Alert severity={pdfStatus.type} sx={{ mt: 2, mx: "auto", maxWidth: 800 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            {pdfStatus.type === "success" ? "✓ PDFs added" :
            pdfStatus.type === "error" ? "Upload failed" : "Notice"}
          </AlertTitle>
          {pdfStatus.msg}
        </Alert>
      )}

      {/* Field Questions Section */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
        <Box
          onClick={() => {
            if (activeStep >= 1) toggleSection("fields");
          }}
          sx={{
            cursor: activeStep >= 1 ? "pointer" : "not-allowed",
            opacity:  activeStep >= 1 ? 1 : 0.6,
            pointerEvents: activeStep >= 1 ? "auto" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.2,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[100],
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.grey[600]
                  : theme.palette.grey[200],
            },
          }}
        >
        <Typography variant="h4" fontWeight={700}>Field Questions</Typography>
          {fieldsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Box>

        <Collapse in={fieldsOpen} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, mx: "auto", maxWidth: 800 }}>
            {/* brief explaination of all the optionss */}
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Define your extraction fields here.
            </Typography>

            {/* Choice cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 3,
              }}
            >
              {/* Option 1: Schema */}
              <Paper
                onClick={() => setFieldMode("schema")}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderWidth: 2,
                  borderColor: fieldMode === "schema" ? "primary.main" : "divider",
                  bgcolor: fieldMode === "schema" ? "primary.50" : "background.paper",
                  transition: "all .2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Stack spacing={1}>
                  <Chip
                    label="Option 1"
                    size="small"
                    color="primary"
                    variant={fieldMode === "schema" ? "filled" : "outlined"}
                    sx={{ width: "fit-content" }}
                  />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Upload CSV / JSON Schema
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically generate fields from column headers or JSON keys.
                    Best for structured documents.
                  </Typography>
                </Stack>
              </Paper>

              {/* Option 2: Manual */}
              <Paper
                onClick={() => setFieldMode("manual")}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderWidth: 2,
                  borderColor: fieldMode === "manual" ? "primary.main" : "divider",
                  bgcolor: fieldMode === "manual" ? "primary.50" : "background.paper",
                  transition: "all .2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Stack spacing={1}>
                  <Chip
                    label="Option 2"
                    size="small"
                    color="primary"
                    variant={fieldMode === "manual" ? "filled" : "outlined"}
                    sx={{ width: "fit-content" }}
                  />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Manual Fields (with presets)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Define custom questions or apply common presets like Research Papers,
                    Business Docs, or Invoices.
                  </Typography>
                </Stack>
              </Paper>
            </Box>

            {fieldMode === "schema" && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", mb: 1 }}>
                  CSV uses column headers; JSON uses object keys. New fields merge automatically.
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Upload CSV / JSON
                  <input hidden type="file" accept=".csv,.json" onChange={handleSchemaUpload} />
                </Button>

                {schemaStatus && (
                  <Alert severity={schemaStatus.type} sx={{ mt: 1 }}>
                    <AlertTitle sx={{ fontWeight: 600 }}>
                      {schemaStatus.type === "success" ? "✓ Schema loaded" : "Schema status"}
                    </AlertTitle>
                    {schemaStatus.msg}
                  </Alert>
                )}
              </Box>
            )}

            {/* Option 2: Manual Fields + Presets */}
            {fieldMode === "manual" && (
              <Box sx={{ mb: 1 }}>
                {/* Manual input row */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    label="Add a field (e.g. 'Authors', 'Methodology')"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                  />

                {/* Quick presets under the input */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1, flexBasis: "100%" }}>

                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      const preset = [
                        "Paper Title",
                        "Authors",
                        "Publication Year",
                        "Abstract",
                        "Methodology",
                        "Results",
                        "Conclusion",
                      ];
                      const seen = new Set(fields.map((x) => x.toLowerCase().trim()));
                      const toAdd = preset.filter(
                        (p) => !seen.has(p.toLowerCase().trim())
                      );
                      setFields((prev) => [...prev, ...toAdd]);
                      setPresetStatus({
                        type: "success",
                        msg: `Research Paper preset added: ${preset.length} fields (${toAdd.length} new).`,
                      });
                    }}
                    sx={{ textTransform: "none", px: 1 }}
                  >
                    + Research Paper
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      const preset = [
                        "Document Title",
                        "Company Name",
                        "Date",
                        "Executive Summary",
                        "Key Findings",
                        "Recommendations",
                      ];
                      const seen = new Set(fields.map((x) => x.toLowerCase().trim()));
                      const toAdd = preset.filter(
                        (p) => !seen.has(p.toLowerCase().trim())
                      );
                      setFields((prev) => [...prev, ...toAdd]);
                      setPresetStatus({
                        type: "success",
                        msg: `Business Document preset added: ${preset.length} fields (${toAdd.length} new).`,
                      });
                    }}
                    sx={{ textTransform: "none", px: 1 }}
                  >
                    + Business Document
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      const preset = [
                        "Invoice Number",
                        "Invoice Date",
                        "Subtotal",
                        "Taxes",
                        "Total Amount Due",
                        "Currency",
                        "Payment Terms",
                      ];
                      const seen = new Set(fields.map((x) => x.toLowerCase().trim()));
                      const toAdd = preset.filter(
                        (p) => !seen.has(p.toLowerCase().trim())
                      );
                      setFields((prev) => [...prev, ...toAdd]);
                      setPresetStatus({
                        type: "success",
                        msg: `Invoice preset added: ${preset.length} fields (${toAdd.length} new).`,
                      });
                    }}
                    sx={{ textTransform: "none", px: 1 }}
                  >
                    + Invoice
                  </Button>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={addField}
                    sx={{ textTransform: "none" }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Alerts: manual + preset */}
                {manualStatus && (
                  <Alert severity={manualStatus.type} sx={{ mt: 1 }}>
                    <AlertTitle sx={{ fontWeight: 600 }}>
                      {manualStatus.type === "success"
                        ? "✓ Field updated"
                        : manualStatus.type === "error"
                        ? "Field error"
                        : "Working…"}
                    </AlertTitle>
                    {manualStatus.msg}
                  </Alert>
                )}

                {presetStatus && (
                  <Alert severity={presetStatus.type} sx={{ mt: 1 }}>
                    <AlertTitle sx={{ fontWeight: 600 }}>
                      {presetStatus.type === "success"
                        ? "✓ Preset applied"
                        : presetStatus.type === "error"
                        ? "Preset error"
                        : "Working…"}
                    </AlertTitle>
                    {presetStatus.msg}
                  </Alert>
                )}
              </Box>
            )}
            {/* Divider */}
            <Divider sx={{ my: 4 }}>
            </Divider>

            {/* Extracted Fields list */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Extracted Fields
              </Typography>
            </Box>

            {fields.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {fields.map((f, i) => (
                  <Chip
                    key={`${f}-${i}`}
                    label={f}
                    onDelete={() => setFields(prev => prev.filter((_, idx) => idx !== i))}
                    sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No fields yet. Upload a schema, select a preset, or add manually.
              </Typography>
            )}

            <Box sx={{ my: 2 }} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                disabled={extracting || !fields.length || (!vstoreId && !files.length)}
                onClick={handleExtract}
                startIcon={extracting || indexing ? <CircularProgress sx={{ color: 'common.white' }} size={16} /> : null}
                sx={{
                  textTransform: "none",
                  "&.Mui-disabled": {
                    opacity: 1,
                    color: "grey.600",
                    WebkitTextFillColor: "unset",
                  },
                }}
              >
                {extracting || indexing ? "Extracting…" : "Extract Information"}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={clearFields}
                disabled={extracting || fields.length === 0}
                sx={{ textTransform: "none" }}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Extraction Alert Status (Success, info or faiilure) */}
      {extractionStatus && (
        <Alert severity={extractionStatus.type} sx={{ mt: 2, mx: "auto", maxWidth: 800 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            {extractionStatus.type === "success" ? "✓ Extraction complete" : "Extraction Status"}
          </AlertTitle>
          {extractionStatus.msg}
        </Alert>
      )}

      {/* Results Section */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
        <Box
          onClick={() => {
            if (activeStep >= 2) toggleSection("results");
          }}
          sx={{
            cursor: activeStep >= 2 ? "pointer" : "not-allowed",
            opacity:  activeStep >= 2 ? 1 : 0.6,
            pointerEvents: activeStep >= 2 ? "auto" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.2,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[100],
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.grey[600]
                  : theme.palette.grey[200],
            },
          }}
        >
          <Typography variant="h4" fontWeight={700}>View Results</Typography>
          {resultsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Box>

        <Collapse in={resultsOpen} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {/* action row */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                disabled={!visibleRows.length}
                onClick={() =>
                  download(
                    `extracted_${(selectedDocName || "document").replace(/[^a-z0-9._-]/gi, "_")}.csv`,
                    toCsv(visibleRows),
                    "text/csv"
                  )
                }
                sx={{ textTransform: "none" }}
              >
                Download CSV
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                disabled={!visibleRows.length}
                onClick={() =>
                  download(
                    `extracted_${(selectedDocName || "document").replace(/[^a-z0-9._-]/gi, "_")}.json`,
                    JSON.stringify(visibleRows, null, 2),
                    "application/json"
                  )
                }
                sx={{ textTransform: "none" }}
              >
                Download JSON
              </Button>
            </Box>

            {/* document switcher for results */}
            {docNames.length > 1 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                <Typography variant="body2">Showing results for:</Typography>
                <select
                  value={currentIdx}
                  onChange={(e) => setCurrentIdx(Number(e.target.value))}
                  style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc" }}
                >
                  {docNames.map((name, i) => (
                    <option key={name} value={i}>{name}</option>
                  ))}
                </select>
              </Box>
            )}

            {/* table */}
            <Paper variant="outlined" sx={{ width: "100%", overflowX: "auto" }}>
              <TableContainer
                component={Paper}
                sx={{
                  width: "100%",
                  maxHeight: 420,
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 240 }}>Answer</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 320 }}>Reasoning</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.length ? (
                      visibleRows.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{r.field}</TableCell>
                          <TableCell sx={{ wordBreak: "break-word" }}>{r.answer}</TableCell>
                          <TableCell sx={{ wordBreak: "break-word" }}>{r.source}</TableCell>
                          <TableCell sx={{ wordBreak: "break-word" }}>{r.reasoning}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                          {selectedDocName
                            ? "No results for this document yet."
                            : "Run “Extract Information” to see results here."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

            </Paper>
          </Box>
        </Collapse>
      </Box>

        
      {/* Tiny right-edge arrow tab */}
      <Button
        onClick={() => setDrawerOpen(true)}
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

      {/* Right sliding instructions drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
              How to use this tool
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 1. Upload PDFs */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            1. Upload PDF(s)
          </Typography>
          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Upload size={22} />
              <span>
                Click <b>Select PDF(s)</b> in the{" "}
                <b>“Upload PDF(s)”</b> section to add one or more files.
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FileText size={24} />
              <span>
                Use the built-in <b>preview viewer</b> to scroll through the
                selected PDF and verify it loaded correctly.
              </span>
            </Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* 2. Define fields */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            2. Define Field Questions
          </Typography>
          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FileText size={24} />
              <span>
                Option 1: <b>Upload a CSV/JSON schema</b> to auto-populate
                fields (column headers / JSON keys).
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ListChecks size={40} />
              <span>
                Option 2: <b>Add fields manually</b> (e.g. “Authors”, “Total
                Amount Due”) and use the <b>presets</b> for common layouts like
                Research Papers, Business Docs, or Invoices.
              </span>
            </Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* 3. Extract & download */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            3. Extract and review results
          </Typography>
          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Download size={24} />
              <span>
                Click <b>Extract Information</b> to run field-by-field
                extraction across all uploaded PDFs.
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TableIcon size={24} />
              <span>
                Use the <b>View Results</b> section to inspect answers, source
                snippets, and reasoning in the results table.
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Download size={24} />
              <span>
                Download the output as <b>CSV</b> or <b>JSON</b> for further
                analysis or integration into your own workflows.
              </span>
            </Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Be aware / limitations */}
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <AlertTriangle size={18} />
            Be aware
          </Typography>

          <Stack spacing={1.1} sx={{ mb: 1.5 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <AlertTriangle size={24} style={{ marginTop: 2 }} />
              <span>
                Only upload <b>public, non-sensitive PDFs</b>. Avoid protected,
                confidential, or classified documents.
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <TableIcon size={24} style={{ marginTop: 2 }} />
              <span>
                Extraction quality depends on <b>PDF structure</b>. Clean,
                text-based PDFs will perform better than scanned, low-quality
                ones.
              </span>
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ mt: 1, fontSize: 12, lineHeight: 1.6 }}
          >
            This tool is meant for <b>experimentation and demos</b>. Double-check
            important values (totals, dates, names) before using them in any
            official report or workflow.
          </Typography>
        </Box>
      </Drawer>

    </Paper>
  );
}

export default PDFExtractionTool;