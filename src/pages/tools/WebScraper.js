/**
 * Web Scraper
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Stack, Alert, AlertTitle, TextField, Button, Drawer, Divider,
  Typography, Box, Grid, Card, CardActionArea, CardContent, Avatar,
  IconButton, Tooltip, CircularProgress, InputAdornment, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from "@mui/material";
import { Search, RefreshCw, ArrowLeft, Send, Bot, Download } from "lucide-react";
import { flushSync } from "react-dom";

const API_BASE = "http://localhost:8000";

/* ---------- helper functions ---------- */
function dateFormat(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function usePresets() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/presets`);
      const j = await r.json();
      setPresets(j?.presets || []);
    } catch (e) {
      setErr("Failed to load presets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { presets, loading, err, reload: load };
}

function isValidUrl(val) {
  try {
    const u = new URL((val || "").trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
function urlKeyStrict(val) {
  const u = new URL((val || "").trim());
  const path = u.pathname.replace(/\/+$/, "");
  return `${u.protocol}//${u.hostname.toLowerCase()}${path}${u.search}`;
}

function downloadCombinedByUrl(u) {
  const href = `${API_BASE}/api/combined-by-url?url=${encodeURIComponent(u)}`;
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- preset card ---------- */
function PresetCard({ item, onRefresh = () => {}, refreshing, onOpen = () => {}, onDownload = () => {} }) {
  const title = item.title || item.site_title;
  const fav = item.favicon;
  const descr =
    item.description ||
    item.site_description ||
    (item.url ? new URL(item.url).origin : "");

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        ":hover": { boxShadow: 2 },
      }}
    >
      <CardActionArea disableRipple onClick={() => onOpen(item.url)}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <Avatar
              src={fav}
              alt={title}
              sx={{ width: 28, height: 28, bgcolor: "grey.100" }}
            />
            <Typography variant="subtitle1" fontWeight={700} noWrap title={title}>
              {title}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Download already scraped data">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onDownload(item.url); }}
                  aria-label="Download already-scraped data"
                >
                  <Download size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Refresh (re-scrape)">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onRefresh(item.url); }}
                  disabled={refreshing}
                >
                  {refreshing ? <CircularProgress size={18} /> : <RefreshCw size={18} />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minHeight: 38 }}
            noWrap
            title={descr}
          >
            {descr || "No description"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1.25, gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              Last scraped: {dateFormat(item.last_scraped_at)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function ConfirmScrapeDialog({
  open,
  onClose,
  onConfirm,
  mode = "scrape",
  url = "",
  inProgress = false,
  estimatedDuration = null,
}) {
  const isRescrape = mode === "rescrape";
  const minutes = estimatedDuration ? Math.ceil(estimatedDuration / 60) : null;

  return (
    <Dialog
      open={open}
      onClose={inProgress ? undefined : onClose}
      PaperProps={{
        sx: {
          backgroundColor: "#fff",
          borderRadius: 3,
          p: 1,
          boxShadow: 4,
          width: 600,
        },
      }}
    >
      <DialogTitle>
        {inProgress
          ? "Scraping in Progress"
          : isRescrape
          ? "Re-scrape Website"
          : "Scrape Website"}
      </DialogTitle>

      <DialogContent>
        {inProgress ? (
          <Alert
            severity="success"
            icon={<CircularProgress size={20} sx={{ mr: 1 }} />}
            sx={{ display: "flex", alignItems: "center", backgroundColor: "#e8f5e9" }}
          >
            <AlertTitle>Scraping in Progress</AlertTitle>
            Please wait while we extract and analyze data from:
            <Typography
              variant="body2"
              sx={{ mt: 1, fontWeight: 500, wordBreak: "break-all" }}
            >
              {url}
            </Typography>
          </Alert>
        ) : (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {isRescrape
              ? `Re-scraping ${url} may take several hours depending on site size.`
              : `Scraping ${url} may take several hours depending on website complexity.`}
            {minutes && (
              <>
                <br />
                <br />
                <strong>Estimated duration:</strong> around {minutes} minute
                {minutes > 1 ? "s" : ""}.
              </>
            )}
            <br />
            <br />
            Do you want to continue?
          </Typography>
        )}
      </DialogContent>

      {!inProgress && (
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onConfirm(url, isRescrape)}
          >
            {isRescrape ? "Re-scrape" : "Scrape"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// Render assistant HTML
function renderAssistantMessage(message) {
  let content = (message.content || "")
    .replace(/```/g, "")
    .replace(/^\s*html\s*/i, "")
    .trim();
  const style = `
    <style>
      table { border-collapse: collapse; width: 100%; margin: 10px 0; }
      table, th, td { border: 1px solid #ddd; }
      th, td { padding: 8px; text-align: left; }
    </style>
  `;
  return <div dangerouslySetInnerHTML={{ __html: style + content }} />;
}

/* ---------- main component ---------- */
export function WebScraper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { presets, loading, err, reload } = usePresets();
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(() => new Set());
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");

  // confirm scrape/rescrape
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState("");
  const [confirmMode, setConfirmMode] = useState("");
  const [scrapeInProgress, setScrapeInProgress] = useState(false);
  const [scrapeEstimate, setScrapeEstimate] = useState(null);

  // chat UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [messages, setMessages] = useState([]);     // [{role, content, timestamp}]
  const [currentMessage, setCurrentMessage] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  // auto-scroll to newest message
  const listRef = React.useRef(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isResponding]);

  // websocket refs
  const wsRef = React.useRef(null);
  const wsReadyRef = React.useRef(false);
  const messagesRef = React.useRef(messages);
  const lastUserMessageRef = React.useRef("");

  // keep a fresh pointer to messages
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const filtered = useMemo(() => {
    if (!q.trim()) return presets;
    const needle = q.toLowerCase();
    return presets.filter((p) =>
      (p.title || "").toLowerCase().includes(needle) ||
      (p.description || "").toLowerCase().includes(needle) ||
      (p.url || "").toLowerCase().includes(needle)
    );
  }, [presets, q]);

  const handleRefresh = (url) => {
    setConfirmMode("rescrape");
    setConfirmUrl(url);
    setScrapeEstimate(getLastDurationFor(url));
    setConfirmOpen(true);
  };

  const existingKeys = useMemo(() => {
    const s = new Set();
    for (const p of presets) {
      try { s.add(urlKeyStrict(p.url)); } catch {}
    }
    return s;
  }, [presets]);

  const handleAdd = async () => {
    setAddErr("");
    if (!isValidUrl(q)) {
      setAddErr("Enter a valid URL that includes http:// or https://");
      return;
    }
    const normalized = q.trim();
    let isExisting = false;
    try { isExisting = existingKeys.has(urlKeyStrict(q)); } catch {}
    setConfirmMode(isExisting ? "rescrape" : "scrape");
    setConfirmUrl(q.trim());
    setScrapeEstimate(isExisting ? getLastDurationFor(normalized) : null);
    setConfirmOpen(true);
  };

  const getLastDurationFor = (url) => {
    if (!url) return null;
    const match = presets.find(p => {
      try { return urlKeyStrict(p.url) === urlKeyStrict(url); }
      catch { return p.url === url; }
    });
    const dur = match && match.last_scrape_duration;
    if (typeof dur === "number" && isFinite(dur)) return dur;
    if (dur != null) {
      const n = Number(dur);
      return isFinite(n) ? n : null;
    }
    return null;
  };

  const runScrape = async (url, force = false) => {
    flushSync(() => {
      setScrapeInProgress(true);
    });
    setAddErr("");

    const prev = presets.find(p => {
      try { return urlKeyStrict(p.url) === urlKeyStrict(url); }
      catch { return p.url === url; }
    });
    setScrapeEstimate(prev?.last_scrape_duration || null);

    try {
      const r = await fetch(`${API_BASE}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, force }),
      });
      const j = await r.json();

      if (j.cache_hit) {
        if (j.last_scrape_duration != null) {
          setScrapeEstimate(j.last_scrape_duration);
        }
      } else if (j.duration_seconds != null) {
        setScrapeEstimate(j.duration_seconds);
      }

      await reload();
    } catch {
      setAddErr("Failed to start scraping. Please try again.");
    } finally {
      setScrapeInProgress(false);
      setConfirmOpen(false);
    }
  };

  const openChatForUrl = (url) => {
    setSelectedUrl(url);
    setChatOpen(true);
    setMessages([{
      role: "bot",
      content: `Chatting over “${url}”. Ask away!`,
      timestamp: new Date(),
    }]);
  };

  // Send handler
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !wsReadyRef.current || isResponding) return;

    const userMsg = currentMessage;
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setCurrentMessage("");
    setIsResponding(true);

    // provisional assistant bubble to stream into
    setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);
    lastUserMessageRef.current = userMsg;

    wsRef.current?.send(JSON.stringify({
      url: selectedUrl,
      message: userMsg,
      model: "gpt-4o-mini",
      temperature: 0.3,
      reasoning_effort: "high",
      token_limit: 100000,
      isAuth: false
    }));
  };

  // WS setup/teardown
  useEffect(() => {
    if (!chatOpen) return;

    const wsUrl = API_BASE.replace(/^http/, "ws") + "/api/ws/website_chat";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => { wsReadyRef.current = true; };

    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }

      if (msg.error) {
        setIsResponding(false);
        setMessages(prev => [...prev, { role: "error", content: msg.error, timestamp: new Date() }]);
        return;
      }

      if (typeof msg.content === "string" && msg.content.length) {
        // stream into the last assistant bubble
        setMessages(prev => {
          const next = [...prev];
          if (!next.length || next[next.length - 1].role !== "assistant") {
            next.push({ role: "assistant", content: "", timestamp: new Date() });
          }
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: (next[next.length - 1].content || "") + msg.content
          };
          return next;
        });
      }

      if (msg.done === true || msg.finish_reason !== undefined) {
        setIsResponding(false);
      }
    };

    ws.onerror = () => { wsReadyRef.current = false; };
    ws.onclose  = () => { wsReadyRef.current = false; wsRef.current = null; };

    return () => {
      try { ws.close(1000, "leaving chat"); } catch {}
      wsRef.current = null;
      wsReadyRef.current = false;
    };
  }, [chatOpen]);


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
      {/* ---------- Header + Description (always same) ---------- */}
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

      {/* ---------- Disclaimer (always same) ---------- */}
      <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>Disclaimer</AlertTitle>
        This scraper is for <strong>demonstration purposes only</strong> and is{" "}
        <strong>not</strong> an enterprise solution. Use only{" "}
        <strong>publicly accessible URLs</strong> and avoid scraping protected, sensitive, or
        classified content. The tool is intended for educational and exploratory use with{" "}
        <strong>no production guarantees</strong>. Scraper may take <strong>several hours</strong> to
        complete based on the URL. By proceeding, you confirm you have the right to access and analyze
        the content you provide.
      </Alert>

      {/* ---------- CONDITIONAL BODY ---------- */}
      {chatOpen ? (
        /* ==================== Chat View ==================== */
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Left: Presets */}
          <Box
            sx={{
              width: { xs: "100%", md: "35%" },
              minWidth: 320,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 1.5,
              background: "#fff",
              height: { xs: "auto", md: 660 },
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              Presets
            </Typography>

            {/* Search + Add */}
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search or paste a URL…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setAddErr(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !adding) handleAdd(); }}
                error={Boolean(addErr)}
                helperText={addErr || undefined}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={adding}
                sx={{ whiteSpace: "nowrap" }}
              >
                {adding ? "Scraping…" : "Add"}
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
              {err && <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert>}

              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={84} sx={{ mb: 1 }} />
                ))
              ) : filtered.length ? (
                filtered.map((item) => (
                  <Box key={item.url} sx={{ mb: 1 }}>
                    <PresetCard
                      item={item}
                      onRefresh={handleRefresh}
                      refreshing={refreshing.has(item.url)}
                      onOpen={openChatForUrl}
                      onDownload={downloadCombinedByUrl}
                    />
                  </Box>
                ))
              ) : (
                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                  No results. Try a different search or <b>Scrape</b> this URL.
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right: Chat Panel */}
          <Box sx={{ flex: 1, minWidth: 0, boxSizing: "border-box", }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Button variant="text" startIcon={<ArrowLeft size={16} />} onClick={() => setChatOpen(false)}>
                Back
              </Button>
              <Typography variant="h4" fontWeight={700} sx={{ ml: 0.5 }}>
                Chat
              </Typography>
              <Chip
                icon={<Bot size={14} />}
                label={selectedUrl}
                variant="outlined"
                size="small"
                sx={{ ml: 2, maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis" }}
              />
              <Box sx={{ flex: 1 }} />
            </Box>

            {/* Chat Messages */}
            <Box
              ref={listRef}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                background: "#fff",
                height: { xs: 480, sm: 560 },
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {messages.map((m, i) => (
                <Box key={i} sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start"
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.25,
                      maxWidth: "85%",
                      borderRadius: 2,
                      bgcolor: m.role === "user" ? "primary.main" : "grey.100",
                      color: m.role === "user" ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    {m.role === "assistant"
                      ? renderAssistantMessage(m)
                      : <Typography variant="body2">{m.content}</Typography>}
                  </Paper>
                  {m.timestamp && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  )}
                </Box>
              ))}

              {isResponding && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mt: 0.5 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Assistant is typing…</Typography>
                </Box>
              )}
            </Box>

            {/* Chat Input */}
            <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
              <TextField
                variant="outlined"
                placeholder="Type your message…"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                fullWidth
                size="small"
                multiline
                maxRows={3}
                disabled={isResponding}
              />
              <Button
                variant="contained"
                endIcon={isResponding ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                disabled={!currentMessage.trim() || isResponding || !wsReadyRef.current}
                onClick={handleSendMessage}
              >
                {isResponding ? "Sending…" : "Send"}
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        /* ==================== Grid View ==================== */
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Search scraped sites… or paste a URL"
              value={q}
              onChange={(e) => { setQ(e.target.value); setAddErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !adding) handleAdd(); }}
              error={Boolean(addErr)}
              helperText={addErr || undefined}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={adding}
              startIcon={adding ? <CircularProgress sx={{ color: 'common.white' }} size={16} /> : null}
            >
              {"Scrape"}
            </Button>
          </Box>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <Grid container spacing={2}>
            {filtered.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.url}>
                <PresetCard
                  item={item}
                  onRefresh={handleRefresh}
                  refreshing={refreshing.has(item.url)}
                  onOpen={openChatForUrl}
                  onDownload={downloadCombinedByUrl}
                />
              </Grid>
            ))}
            {!loading && filtered.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                  No results. Try a different search or <b>Scrape</b> this website Url.
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}

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

      <ConfirmScrapeDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={(url, isRescrape) => runScrape(url, isRescrape)}
        mode={confirmMode}
        url={confirmUrl}
        inProgress={scrapeInProgress}
        estimatedDuration={scrapeEstimate}
      />
    </Paper>
  );
}

export default WebScraper;
