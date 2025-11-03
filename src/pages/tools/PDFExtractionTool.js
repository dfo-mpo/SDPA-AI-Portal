/**
 * PDF Extraction Tool
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Paper, Stack, Alert, AlertTitle, TextField, Button, Drawer, Divider,
  Typography, Box, Stepper, Step, StepLabel, LinearProgress, Collapse, Chip
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  /* Functions */
  function handleFileInput(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    const map = new Map(files.map((f) => [fileKey(f), f]));
    let added = 0;
    for (const f of picked) { if (!map.has(fileKey(f))) added++; map.set(fileKey(f), f); }
    setFiles(Array.from(map.values()));
    e.target.value = "";
    setPdfStatus(added
      ? { type: "success", msg: `Added ${added} PDF${added>1?"s":""}.` }
      : { type: "info", msg: "No new PDFs (duplicates ignored)." }
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

  useEffect(() => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  /* UI */
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
            {["Upload PDF", "Add Question Fields", "View Results"].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

      {/* Upload PDF(s) Section */}
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box
          onClick={() => setUploadOpen((v) => !v)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.2,
            borderRadius: 1,
            bgcolor: "grey.100",
            "&:hover": { bgcolor: "grey.200" },
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

          {/* PDF Upload Alert Status (Success, info or faiilure) */}
          {pdfStatus && (
            <Alert severity={pdfStatus.type} sx={{ mt: 2, mx: "auto", maxWidth: 800 }}>
              <AlertTitle sx={{ fontWeight: 600 }}>
                {pdfStatus.type === "success" ? "✓ PDF(s) added"
                  : pdfStatus.type === "error" ? "Upload failed" : "Notice"}
              </AlertTitle>
              {pdfStatus.msg}
            </Alert>
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

      {/* Question Fields Section */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
        <Box
          onClick={() => setFieldsOpen((v) => !v)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.2,
            borderRadius: 1,
            bgcolor: "grey.100",
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          <Typography variant="h4" fontWeight={700}>Question Fields</Typography>
          {fieldsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Box>

        <Collapse in={fieldsOpen} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, mx: "auto", maxWidth: 800 }}>
            {/* brief explaination of all the optionss */}
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              You have <b>3</b> ways to define fields. Pick one, or mix &amp; match:
            </Typography>

            {/* Option 1: Upload CSV/JSON Schema */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip label="Option 1" size="small" color="primary" variant="outlined" />
              <Typography variant="subtitle1" fontWeight={700}>
                Upload CSV/JSON Schema
              </Typography>
            </Stack>
            <Box sx={{ p: 1, mb: 2 }}>
              <Button variant="outlined" component="label" size="small" sx={{ textTransform: "none" }}>
                Upload CSV/JSON
                <input hidden type="file" accept=".csv,.json" onChange={handleSchemaUpload} />
              </Button>
              <Typography variant="body2" sx={{ mt: .5, color: "text.secondary" }}>
                CSV uses column headers; JSON uses object keys. New fields get merged automatically.
              </Typography>
            </Box>

            {/* Schema Upload Alert Status (Success, info or faiilure) */}
            {schemaStatus && (
              <Alert
                severity={schemaStatus.type}
                sx={{ mt: 1 }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {schemaStatus.type === "success" ? "✓ Schema loaded"
                    : schemaStatus.type === "error" ? "Schema error" : "Working…"}
                </AlertTitle>
                {schemaStatus.msg}
              </Alert>
            )}

            {/* OR divider */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">OR</Typography>
            </Divider>

            {/* Option 2: Quick Add Presets */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip label="Option 2" size="small" color="primary" variant="outlined" />
              <Typography variant="subtitle1" fontWeight={700}>
                Quick Add Presets
              </Typography>
            </Stack>
            <Box sx={{ p: 1, mb: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px,1fr))", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", minHeight: 44 }}
                  onClick={() => {
                    const preset = ["Paper Title","Authors","Publication Year","Abstract","Methodology","Results","Conclusion"];
                    const seen = new Set(fields.map(x => x.toLowerCase().trim()));
                    const toAdd = preset.filter(p => !seen.has(p.toLowerCase().trim()));
                    setFields(prev => [...prev, ...toAdd]);
                    setPresetStatus({
                      type: "success",
                      msg: `Research Paper Preset added: ${preset.length} fields (${toAdd.length} new).`
                    });
                  }}
                >
                  Research Paper
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", minHeight: 44 }}
                  onClick={() => {
                    const preset = ["Document Title","Company Name","Date","Executive Summary","Key Findings","Recommendations"];
                    const seen = new Set(fields.map(x => x.toLowerCase().trim()));
                    const toAdd = preset.filter(p => !seen.has(p.toLowerCase().trim()));
                    setFields(prev => [...prev, ...toAdd]);
                    setPresetStatus({
                      type: "success",
                      msg: `Business Document Preset added: ${preset.length} fields (${toAdd.length} new).`
                    });
                  }}
                >
                  Business Document
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", minHeight: 44 }}
                  onClick={() => {
                    const preset = ["Invoice Number","Invoice Date","Subtotal","Taxes","Total Amount Due","Currency","Payment Terms"];
                    const seen = new Set(fields.map(x => x.toLowerCase().trim()));
                    const toAdd = preset.filter(p => !seen.has(p.toLowerCase().trim()));
                    setFields(prev => [...prev, ...toAdd]);
                    setPresetStatus({
                      type: "success",
                      msg: `Invoice Preset added: ${preset.length} fields (${toAdd.length} new).`
                    });
                  }}
                >
                  Invoice
                </Button>
              </Box>
            </Box>

            {/* Preset Alert Status (Success, info or faiilure) */}
            {presetStatus && (
              <Alert
                severity={presetStatus.type}
                sx={{ mt: 1 }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {presetStatus.type === "success" ? "✓ Preset applied"
                    : presetStatus.type === "error" ? "Preset error" : "Working…"}
                </AlertTitle>
                {presetStatus.msg}
              </Alert>
            )}

            {/* OR divider */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">OR</Typography>
            </Divider>

            {/* Option 3: Manual Fields */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip label="Option 3" size="small" color="primary" variant="outlined" />
              <Typography variant="subtitle1" fontWeight={700}>
                Manual Fields
              </Typography>
            </Stack>
            <Box sx={{ p: 1, mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Add a field (e.g. 'Authors', 'Methodology')"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addField}
                  sx={{ textTransform: "none", "&.MuiButton-contained": { color: "white" } }}
                >
                  Add
                </Button>
                <Button variant="outlined" size="small" sx={{ textTransform: "none" }} onClick={clearFields}>
                  Clear
                </Button>
              </Box>

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

              {/* Manual Upload Alert Status (Success, info or faiilure) */}
              {manualStatus && (
                <Alert
                  severity={manualStatus.type}
                  sx={{ mt: 1 }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>
                    {manualStatus.type === "success" ? "✓ Field updated"
                      : manualStatus.type === "error" ? "Field error" : "Working…"}
                  </AlertTitle>
                  {manualStatus.msg}
                </Alert>
              )}

            </Box>
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
        {"?"}
      </Button>

      {/* Right sliding instructions drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 360, background: "#f5f5f5" } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h2" fontWeight={700}>How to Use</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
            Steps
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
            <b>1.</b> <b>Upload PDF(s)</b> (one or many).  
            <br/><b>2.</b> (Optional) Upload a <b>CSV/JSON schema</b> to auto-populate extraction fields.  
            <br/><b>3.</b> Add or edit <b>custom fields</b> (e.g., “Authors”, “Methodology”, “Invoice Total”).  
            <br/><b>4.</b> Click <b>Extract Information</b> to get per-field answers, with source & reasoning.  
            <br/><b>5.</b> <b>Download</b> results as CSV/JSON and ask follow-up questions.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700}>Quick Add Presets</Typography>
          <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.7 }}>
            • <b>Research Paper</b>: Paper Title, Authors, Year, Abstract, Methodology, Results, Conclusion  
            <br/>• <b>Business Doc</b>: Document Title, Company, Date, Executive Summary, Key Findings, Recommendations  
            <br/>• <b>Invoice</b>: Invoice #, Dates, Parties, Line Items, Subtotal, Tax, Total, Terms
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700}>Example Prompts</Typography>
          <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.7 }}>
            • “Summarize each PDF in 5 bullets.”  
            <br/>• “What are the key findings in Section 3?”  
            <br/>• “Return the single total amount due and currency.”
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700}>Tips</Typography>
          <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.7 }}>
            • For long PDFs, ask for a <b>summary</b> first, then drill down.  
            <br/>• Use a <b>schema CSV/JSON</b> to speed up field creation and avoid duplicates.  
          </Typography>

        </Box>
      </Drawer>

    </Paper>
  );
}

export default PDFExtractionTool;