/**
 * Web Scraper
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Paper, Stack, Alert, AlertTitle, TextField, Button,
  Drawer, Divider, Typography, Box, Collapse, CircularProgress,
  Stepper, Step, StepLabel, LinearProgress
} from "@mui/material";
import { ChevronDown, ChevronUp, Download} from "lucide-react";
import Autocomplete from "@mui/material/Autocomplete";

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
  const [presets, setPresets] = useState([]);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(null);
  const parseSectionRef = useRef(null);
  const knownUrls = useMemo(
    () => (presets?.map((p) => p?.url || p)?.filter(Boolean) || []),
    [presets]
  );
  const [openSections, setOpenSections] = useState({
    input: true,
    parse: false,
    result: false,
  });
  const [step, setStep] = useState("input");
  const STEP_INDEX = { input: 0, parse: 1, result: 2 };
  const TOTAL_STEPS = 3;
  const ACTIVE_STEP =
  step === "result" && parseStatus.type === "success"
    ? TOTAL_STEPS
    : STEP_INDEX[step];
  const safeToggle = (key) => {
    if (STEP_INDEX[key] <= STEP_INDEX[step]) {
      setOpenSections((s) => ({ ...s, [key]: !s[key] }));
    }
  };

  async function handleScrape() {
    setErrorMsg(null);
    setParsedOutput("");
    setSessionId(null);
    setParseStatus({ type: null, msg: "" });
    setStep("input");
    setOpenSections({ input: true, parse: false, result: false });

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
      setStep("parse");
      setOpenSections({ input: false, parse: true, result: false });

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
      let res;
      if (selectedPresetUrl) {
        res = await fetch(`${API_BASE}/api/parse-by-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: selectedPresetUrl,
            parse_description: question,
          }),
        });
      } else {
        if (!sessionId) {
          setErrorMsg("Nothing scraped yet. Please scrape first or select a preset.");
          setLoadingParse(false);
          return;
        }
        res = await fetch(`${API_BASE}/api/parse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parse_description: question,
            session_id: sessionId,
          }),
        });
      }

      if (!res.ok) throw new Error(`Parse failed (${res.status})`);
      const data = await res.json();

      setParsedOutput((data && data.result) || "");
      setParseStatus({ type: "success", msg: "Parse complete. See the result below." });
      setStep("result");
      setOpenSections({ input: false, parse: false, result: true });
    } catch (e) {
      setErrorMsg((e && e.message) || "Parse failed");
      setParseStatus({ type: "error", msg: "Parse failed. Refine your prompt and try again." });
    } finally {
      setLoadingParse(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/presets`);
        if (!res.ok) return;
        const data = await res.json();
        setPresets(data?.presets || []);
      } catch {}
    })();
  }, []);

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

        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={ACTIVE_STEP} alternativeLabel>
            {["Enter Website URL", "Ask Questions About the Data", "View Results"].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {(loadingScrape || loadingParse) && (
            <LinearProgress sx={{ mt: 1 }} />
          )}
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

         <Box sx={{ maxWidth: 720, mx: "auto" }}>
            <Box
              onClick={() => safeToggle("input")}
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
              <Typography variant="h4" fontWeight={700}>Enter Website URL</Typography>
              {openSections.input ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </Box>
            <Collapse in={openSections.input} timeout="auto" unmountOnExit>
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
                <Autocomplete
                  fullWidth
                  freeSolo
                  disablePortal
                  options={knownUrls}
                  inputValue={url}
                  value={selectedPresetUrl || null}
                  onInputChange={(_, v) => {
                    setUrl(v || "");
                    // If user types something not in presets, treat it as new URL
                    if (!knownUrls.includes(v || "")) {
                      setSelectedPresetUrl(null);
                      setSessionId(null);
                      setStep("input");
                      setOpenSections({ input: true, parse: false, result: false });
                      setScrapeStatus({ type: null, msg: "" });
                    }
                  }}
                  onChange={(_, v) => {
                    // Selecting a preset from the dropdown
                    const val = v || "";
                    setUrl(val);
                    if (val && knownUrls.includes(val)) {
                      setSelectedPresetUrl(val);
                      setSessionId("__VECTOR__"); // user can parse immediately
                      setStep("parse");
                      setOpenSections({ input: false, parse: true, result: false });
                      setScrapeStatus({
                        type: "success",
                        msg: "Preset selected. You can parse immediately without scraping.",
                      });
                      setTimeout(() => {
                        parseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 0);
                    } else {
                      setSelectedPresetUrl(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Enter or select a previously scraped URL"
                      placeholder="https://example.com"
                      fullWidth
                      sx={{
                        "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator": {
                          padding: 0,
                          margin: 0,
                          background: "transparent !important",
                          border: "none !important",
                          boxShadow: "none !important",
                          "&:hover": {
                            background: "transparent !important",
                            border: "none !important",
                            boxShadow: "none !important",
                          },
                        },
                      }}
                    />
                  )}
                  PaperComponent={(props) => (
                    <Paper
                      {...props}
                      elevation={3}
                      sx={{
                        bgcolor: "#ffffff",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  )}
                  componentsProps={{ listbox: { sx: { bgcolor: "#ffffff" } } }}
                />

                <Button
                  onClick={handleScrape}
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={loadingScrape || !url || !!selectedPresetUrl}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2.5,
                    "&.MuiButton-contained": { color: "white" },
                  }}
                  title={
                    !url
                      ? "Enter a URL to enable scraping"
                      : selectedPresetUrl
                      ? "Already scraped — jump to Parse"
                      : "Scrape content"
                  }
                >
                  {loadingScrape ? "Scraping..." : "Scrape"}
                </Button>
              </Box>
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, ml: 0.5, color: "text.secondary" }}
              >
                Type a new URL and click Scrape - or select a previously scraped URL to jump directly to parsing.
              </Typography>
            </Collapse>     
              {scrapeStatus.type && (
                <>
                  <Alert
                    severity={scrapeStatus.type}
                    icon={scrapeStatus.type === "info" ? <CircularProgress size={18} /> : undefined}
                    sx={{
                      mt: 2,
                      mx: "auto",
                      maxWidth: 720,
                      alignItems: "center",
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                      {scrapeStatus.type === "success"
                        ? "✓ Scrape complete"
                        : scrapeStatus.type === "error"
                        ? "Scrape failed"
                        : "Working…"}
                    </AlertTitle>
                    <Typography variant="body2">{scrapeStatus.msg}</Typography>
                  </Alert>
                  
                  {scrapeStatus.type === "success" && downloadHref && (
                    <Box sx={{ mt: 1.5, maxWidth: 720, mx: "auto" }}>
                      <Button
                        component="a"
                        href={downloadHref}
                        variant="outlined"
                        size="small"
                        startIcon={<Download size={16} />}
                        sx={{ 
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Download Scraped Data
                      </Button>
                    </Box>
                  )}

                  {selectedPresetUrl && (
                    <Box sx={{ mt: 1.5, maxWidth: 720, mx: "auto" }}>
                      <Button
                        component="a"
                        href={`${API_BASE}/api/combined-by-url?url=${encodeURIComponent(selectedPresetUrl)}`}
                        variant="outlined"
                        size="small"
                        startIcon={<Download size={16} />}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Download Scraped Data
                      </Button>
                    </Box>
                  )}
                </>
              )}
            
            <Box sx={{ mt: 3 }} />
            <Box
              ref={parseSectionRef}
              onClick={() => safeToggle("parse")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 3,
                p: 1.2,
                borderRadius: 1,
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <Typography variant="h4" fontWeight={700}>Ask Questions About the Data</Typography>
              {openSections.parse ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </Box>

            <Collapse in={openSections.parse} timeout="auto" unmountOnExit>
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
            </Collapse>
              {parseStatus.type && (
                <>
                  <Alert
                    severity={parseStatus.type}
                    icon={parseStatus.type === "info" ? <CircularProgress size={18} /> : undefined}
                    sx={{
                      mt: 1.5,
                      maxWidth: 720,
                      alignItems: "center",
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                      {parseStatus.type === "success"
                        ? "✓ Parse complete"
                        : parseStatus.type === "error"
                        ? "Parse failed"
                        : "Working…"}
                    </AlertTitle>
                    <Typography variant="body2">{parseStatus.msg}</Typography>
                  </Alert>

                  {parseStatus.type === "success" && parsedOutput && (
                    <Box sx={{ mt: 1.5, maxWidth: 720 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={downloadingParsed}
                        startIcon={<Download size={16} />}
                        onClick={() => {
                          try {
                            setDownloadingParsed(true);
                            downloadTextFile(makeFileNameFromUrl(url, "parsed"), parsedOutput);
                          } finally {
                            setDownloadingParsed(false);
                          }
                        }}
                        sx={{ 
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        {downloadingParsed ? "Preparing…" : "Download Parsed Result"}
                      </Button>
                    </Box>
                  )}
                </>
              )}

          <Box sx={{ mt: 3 }} />

          <Box
            onClick={() => safeToggle("result")}
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
            <Typography variant="h4" fontWeight={700}>View Results</Typography>
            {openSections.result ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
          </Box>

          <Box sx={{ mt: 2 }} />

          <Collapse in={openSections.result} timeout="auto" unmountOnExit>
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
            </Collapse>
      </Box>

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
            • "Return the single <b>name</b> with the <b>highest salary</b>."
            <br />• "List all <b>emails</b> found on the page, one per line."
            <br />• "Extract a <b>table</b> with columns: Name | Title | City."
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