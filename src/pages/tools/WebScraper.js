/**
 * Web Scraper
 */

import React, { useState } from "react";
import { Grid } from "@mui/material";
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
  Box,
} from "@mui/material";

const API_BASE = "http://localhost:8000";

function makeFileNameFromUrl(u, suffix) {
  try {
    const { hostname, pathname } = new URL(u.trim());
    const safePath = pathname.replace(/[^a-z0-9\-_.]+/gi, "-").replace(/^-+|-+$/g, "");
    const base = safePath ? `${hostname}${safePath}` : hostname;
    return `parsed_${base || "result"}${suffix ? `_${suffix}` : ""}.txt`;
  } catch {
    return `parsed_result.txt`;
  }
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text ?? ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function WebScraper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [parsedOutput, setParsedOutput] = useState("");
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingParse, setLoadingParse] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [scrapeStatus, setScrapeStatus] = useState({ type: null, msg: "" });
  const [parseStatus, setParseStatus] = useState({ type: null, msg: "" });
  const [downloadHref, setDownloadHref] = useState(null);
  const [downloadingParsed, setDownloadingParsed] = useState(false);

  async function handleScrape() {
    setErrorMsg(null);
    setParsedOutput("");
    setSessionId(null);
    setParseStatus({ type: null, msg: "" });

    if (!url.trim()) {
      setErrorMsg("Please enter a URL.");
      return;
    }

    setLoadingScrape(true);
    setScrapeStatus({ type: "info", msg: "Scraping… please wait." });

    try {
      const res = await fetch(`${API_BASE}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      if (!res.ok) throw new Error(`Scrape failed (${res.status})`);
      const data = await res.json();

      if (!data || !data.session_id) throw new Error("No session_id returned");
      
      setSessionId(data.session_id);
      setDownloadHref(`${API_BASE}/api/scrape/${data.session_id}/combined.txt`);

      setScrapeStatus({
        type: "success",
        msg: "Successfully scraped. Now enter prompts and click Parse.",
      });

    } catch (e) {
      setErrorMsg((e && e.message) || "Scrape failed");
      setScrapeStatus({ type: "error", msg: "Scrape failed. Check the URL and try again." });
    } finally {
      setLoadingScrape(false);
    }
  }

  async function handleParse() {
    setErrorMsg(null);
    setParsedOutput("");

    if (!sessionId) {
      setErrorMsg("Nothing scraped yet. Please scrape first.");
      return;
    }

    if (!question.trim()) {
      setErrorMsg("Please enter what to extract / your question.");
      return;
    }
    
    setLoadingParse(true);
    setParseStatus({ type: "info", msg: "Parsing… analyzing the scraped content." });

    try {
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parse_description: question,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error(`Parse failed (${res.status})`);
      const data = await res.json();

      setParsedOutput((data && data.result) || "");
      setParseStatus({ type: "success", msg: "Parse complete. See the result on the right." });

    } catch (e) {
      setErrorMsg((e && e.message) || "Parse failed");
      setParseStatus({ type: "error", msg: "Parse failed. Refine your prompt and try again." });
    } finally {
      setLoadingParse(false);
    }
  }

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
          <p style={{ fontSize: 50, fontWeight: 600, marginTop: 30 }}>Web Scraper</p>
          <p style={{ fontSize: 20, marginTop: 0 }}>
            Extract data from any public website using a URL
          </p>
          <p style={{ marginTop: 20 }}>
            This tool allows users to input a website URL and automatically scrape its contents for
            structured data extraction. Once scraped, users can ask questions about the page using
            OpenAI-powered analysis. Ideal for quick insights, research, or prototyping, this scraper
            simplifies the process of turning raw web content into actionable answers.
          </p>
        </Stack>

        {/* Disclaimer banner */}
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Disclaimer</AlertTitle>
          This scraper is for <strong>demonstration purposes only</strong> and is{" "}
          <strong>not</strong> an enterprise solution. Use only{" "}
          <strong>publicly accessible URLs</strong> and avoid scraping protected, sensitive, or
          classified content. The tool is intended for educational and exploratory use with{" "}
          <strong>no production guarantees</strong>. Scraper may take <strong>several hours</strong> to
          complete based on the URL. By proceeding, you confirm you have the right to access and analyze the content you provide.
        </Alert>

        <Box sx={{ mt: 4 }} />

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          {/* LEFT: inputs */}
          <Grid item xs={12} md={6}>
          {/* URL input + Scrape button*/}
            <Typography variant="h4" fontWeight={700}>Input URL</Typography>
            <Box
              sx={{
                mt: 2,
                mx: "auto",
                maxWidth: 720,
                display: "flex",
                gap: 1.5,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="Enter Website URL"
                placeholder="https://example.com"
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button
                onClick={handleScrape}
                disabled={loadingScrape}
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2.5,
                  "&.MuiButton-contained": { color: "white" },
                }}
                title={!url ? "Enter a URL to enable scraping" : "Scrape content"}
              >
                {loadingScrape ? "Scraping..." : "Scrape"}
              </Button>
            </Box>

            {scrapeStatus.type && (
              <Alert
                severity={scrapeStatus.type}
                sx={{
                  mt: 2,
                  mx: "auto",
                  maxWidth: 720,
                  alignItems: "center",
                  borderLeft: 6,
                  borderLeftColor: (theme) =>
                    scrapeStatus.type === "success"
                      ? theme.palette.success.main
                      : scrapeStatus.type === "error"
                      ? theme.palette.error.main
                      : theme.palette.info.main,
                }}
                action={
                  scrapeStatus.type === "success" && downloadHref ? (
                    <Button
                      component="a"
                      href={downloadHref}
                      variant="contained"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    >
                      Download Data (.txt)
                    </Button>
                  ) : null
                }
              >
                <AlertTitle sx={{ fontWeight: 800, mb: 0 }}>
                  {scrapeStatus.type === "success"
                    ? "Scrape complete"
                    : scrapeStatus.type === "error"
                    ? "Scrape failed"
                    : "Working…"}
                </AlertTitle>
                {scrapeStatus.msg}
              </Alert>
            )}
            
            <Box sx={{ mt: 3 }} />
            <Typography variant="h4" fontWeight={700}>Parse</Typography>
            {/* Prompt input + Parse button */}
            <Box
              sx={{
                mt: 2,
                mx: "auto",
                maxWidth: 720,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
              >
              <TextField
                size="small"
                label="Ask a question or describe what to extract"
                placeholder="e.g., Extract a table with columns: Name | Title | City..."
                fullWidth
                multiline
                minRows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 125,
                    alignItems: "flex-start",
                  },
                }}
              />
              <Button
                onClick={handleParse}
                disabled={!sessionId || loadingParse}
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2.5,
                  "&.MuiButton-contained": { color: "white" },
                }}
                title={!sessionId ? "Scrape first to enable parsing" : "Parse content"}
              >
                {loadingParse ? "Parsing..." : "Parse"}
              </Button>
            </Box>

            {/* Parse status banner */}
            {parseStatus.type && (
            <Alert
              severity={parseStatus.type}
              sx={{
                mt: 1.5,
                maxWidth: 720,
                alignItems: "center",
                borderLeft: 6,
                borderLeftColor: (theme) =>
                  parseStatus.type === "success"
                    ? theme.palette.success.main
                    : parseStatus.type === "error"
                    ? theme.palette.error.main
                    : theme.palette.info.main,
              }}
              action={
                parseStatus.type === "success" && parsedOutput ? (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={downloadingParsed}
                    onClick={() => {
                      try {
                        setDownloadingParsed(true);
                        downloadTextFile(makeFileNameFromUrl(url, "parsed"), parsedOutput);
                      } finally {
                        setDownloadingParsed(false);
                      }
                    }}
                    sx={{ fontWeight: 700 }}
                  >
                    {downloadingParsed ? "Preparing…" : "Download Result (.txt)"}
                  </Button>
                ) : null
              }
            >
              <AlertTitle sx={{ fontWeight: 800, mb: 0 }}>
                {parseStatus.type === "success"
                  ? "Parse complete"
                  : parseStatus.type === "error"
                  ? "Parse failed"
                  : "Working…"}
              </AlertTitle>
              {parseStatus.msg}
            </Alert>
          )}

          </Grid>
      
          {/* RIGHT: parsed output */}
          <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight={700}>Result</Typography>
            {parsedOutput ? (
              <Box
                sx={{
                  maxHeight: 360,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.45,
                  p: 1,
                  backgroundColor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {parsedOutput}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Parsed output will appear here after you click <b>Parse</b>.
              </Typography>
            )}
        </Grid>
      </Grid>

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h2" fontWeight={700}>
              How to Use
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5}}>
            Steps
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            <b>1.</b> Enter a URL you wish to scrape.
            <br/><b>2.</b> Click <b>Scrape</b> button.
            <br/><b>3.</b> Wait until scraper is finished scraping.
            <br/><b>4.</b> Ask questions about the data scraped.
            <br/><b>5.</b> Click <b>Parse</b> button and wait for response.
            <br/><b>6.</b> Wait for a response.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700}>
            Example Prompts
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            • “Return the single <b>name</b> with the <b>highest salary</b>.”
            <br />• “List all <b>emails</b> found on the page, one per line.”
            <br />• “Extract a <b>table</b> with columns: Name | Title | City.”
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" fontWeight={700}>
            Tips
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            • If output repeats, request <b>only one</b> result.
            <br />• Specify format: paragraph, bullet point, document.
          </Typography>
        </Box>
      </Drawer>
    </Paper>
  );
}

export default WebScraper;
