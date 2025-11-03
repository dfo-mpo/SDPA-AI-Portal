/**
 * PDF Extraction Tool
 */

import React, { useState, useEffect } from "react";
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

  /* Functions */
  function handleFileInput(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    const map = new Map(files.map((f) => [fileKey(f), f]));
    for (const f of picked) map.set(fileKey(f), f);
    setFiles(Array.from(map.values()));
    e.target.value = "";
  }

  function removeFileAt(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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