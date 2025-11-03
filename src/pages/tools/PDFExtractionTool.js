/**
 * PDF Extraction Tool
 */

import React, { useState } from "react";
import {
  Paper,
  Stack,
  Alert,
  AlertTitle,
  TextField,
  Button,
  Drawer,
  Divider,
  Typography,
  Box, Stepper, Step, StepLabel, LinearProgress
} from "@mui/material";

export function PDFExtractionTool() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingParse, setLoadingParse] = useState(false);

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

          {(loadingScrape || loadingParse) && <LinearProgress sx={{ mt: 1 }} />}
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