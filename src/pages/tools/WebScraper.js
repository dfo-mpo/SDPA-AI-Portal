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
import { 
  Search, RefreshCw, Send, Bot, Download, AlertTriangle, 
  HelpCircle, Clock, GaugeCircle, Globe2 } from "lucide-react";
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

const COOLDOWN_DAYS = 30;

function disabledUntil(iso) {
  if (!iso) return null;
  const now = Date.now();
  const until = new Date(iso).getTime();
  let ms = until - now;
  if (ms <= 0) return "now";
  const sec = Math.ceil(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days} day${days>1?"s":""}${hours?` ${hours}h`:""}`;
  if (hours > 0) return `${hours} hour${hours>1?"s":""}${minutes?` ${minutes}m`:""}`;
  return `${minutes || 1} minute${minutes>1?"s":""}`;
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
  nextAllowedAt = null,
}) {
  const isRescrape = mode === "rescrape";
  const minutes = estimatedDuration ? Math.ceil(estimatedDuration / 60) : null;
  const rescrapeLocked = isRescrape && Boolean(nextAllowedAt);

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
                <strong>Estimated scrape duration:</strong> around {minutes} minute
                {minutes > 1 ? "s" : ""}.
              </>
            )}
            {isRescrape && nextAllowedAt && (
              <>
                <br />
                <strong>Re-scrape available in:</strong> {disabledUntil(nextAllowedAt)} (until {new Date(nextAllowedAt).toLocaleString()})
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

          <Tooltip
            title={
              rescrapeLocked
                ? `Must wait for re-scrape availability (${disabledUntil(nextAllowedAt)} left)`
                : ""
            }
            disableHoverListener={!rescrapeLocked}
          >
            <span>
              <Button
                variant="contained"
                color="primary"
                disabled={rescrapeLocked}
                onClick={() => onConfirm(url, isRescrape)}
                sx={{
                  ...(rescrapeLocked ? { cursor: "not-allowed" } : {}),
                  "&.Mui-disabled": {
                    backgroundColor: (theme) => `${theme.palette.grey[300]} !important`,
                    color: (theme) => `${theme.palette.grey[700]} !important`,
                    boxShadow: "none",
                  },
                  "&.Mui-disabled:hover": {
                    backgroundColor: (theme) => `${theme.palette.grey[300]} !important`,
                  },
                }}
                aria-label={isRescrape ? "Re-scrape" : "Scrape"}
              >
                {isRescrape ? "Re-scrape" : "Scrape"}
              </Button>
            </span>
          </Tooltip>
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
  const [chatByUrl, setChatByUrl] = useState({});
  const chatByUrlRef = React.useRef({});
  const selectedUrlRef = React.useRef(selectedUrl);

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

  // keep a fresh pointer to chatByUrl
  useEffect(() => { chatByUrlRef.current = chatByUrl; }, [chatByUrl]);

  // keep a fresh pointer to selectedUrl
  useEffect(() => { selectedUrlRef.current = selectedUrl; }, [selectedUrl]);

  // whenever messages change, store them under the current URL key
  useEffect(() => {
    if (!selectedUrlRef.current) return;
    const key = urlKeyStrict(selectedUrlRef.current);
    setChatByUrl(prev => ({
      ...prev,
      [key]: messages,
    }));
  }, [messages]);

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

  const dialogNextAllowedAt = useMemo(() => {
    if (!confirmUrl) return null;
    // find the matching preset row for this URL
    const match = presets.find(p => {
      try { return urlKeyStrict(p.url) === urlKeyStrict(confirmUrl); }
      catch { return p.url === confirmUrl; }
    });
    const last = match?.last_scraped_at;
    if (!last) return null;

    const lastMs = new Date(last).getTime();
    if (Number.isNaN(lastMs)) return null;

    const next = new Date(lastMs + COOLDOWN_DAYS * 86400000);
    return next.getTime() > Date.now() ? next.toISOString() : null;
  }, [presets, confirmUrl]);


  const openChatForUrl = (url) => {
    setSelectedUrl(url);
    setChatOpen(true);
    const key = urlKeyStrict(url);
    const existing = chatByUrlRef.current[key];

    // if we’ve already chatted with this URL, restore its history
    if (existing && existing.length) {
      setMessages(existing);
      return;
    }

    // otherwise, start a fresh chat for this URL
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
        const current = messagesRef.current;
        const last = current[current.length - 1];
        const hasAssistantContent =
          last &&
          last.role === "assistant" &&
          (last.content || "").trim().length > 0;

        if (hasAssistantContent) {
          setIsResponding(false);
        }
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
        <p style={{ fontSize: 50, fontWeight: 600, marginTop: 10 }}>Web Scraper</p>
        <p style={{ fontSize: 20, marginTop: 0 }}>
          Extract data from any public website using a URL
        </p>
        <p style={{ marginTop: 30 }}>
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
            borderColor: "divider",
            borderRadius: 2,
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
            <Typography variant="h4" fontWeight={700} sx={{ ml: 0.5 }}>
              ChatBot
            </Typography>
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
              endIcon={isResponding ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Send size={16} />}
              disabled={!currentMessage.trim() || isResponding || !wsReadyRef.current}
              onClick={handleSendMessage}
              sx={{
                '&.Mui-disabled': {
                  bgcolor: 'grey.400',
                  color: 'grey.100',
                },
                '&.Mui-disabled:hover': {
                  bgcolor: 'grey.400',
                },
              }}
            >
              {isResponding ? "Sending…" : "Send"}
            </Button>
          </Box>
        </Box>
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 380, background: "#f5f5f5" },
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
              About this page
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 1. Model & analysis */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            1. Model & analysis
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 2 }}>
            Configure the <b>model type</b> and behavior from the Web Scraper settings
            panel on the left-hand side. GPT models currently used include{" "}
            <b>GPT-4o mini</b>, <b>GPT-4o</b>, and <b>GPT-3.5</b>.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 2. Add or select a website */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            2. Add or select a website
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
            Use the left panel to <b>search existing presets</b> or{" "}
            <b>add a new URL</b> to scrape.
          </Typography>

          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Search size={18} />
              <span>
                Use the <b>search box</b> to filter presets by title,
                description, or URL.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Download size={20} />
              <span>
                Click <b>Download</b> on a preset card to retrieve already-scraped
                text for that URL.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <RefreshCw size={20} />
              <span>
                Use <b>Refresh</b> to re-scrape a site when content has changed
                (subject to cooldown rules).
              </span>
            </Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* 3. Chat with the scraped data */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            3. Chat with the scraped data
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
            Click on a preset card to open the <b>chat panel</b> on the right.
            The assistant will answer questions based on the scraped content.
          </Typography>

          <Stack spacing={1.1} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Bot size={20} />
              <span>
                Ask <b>specific questions</b> such as summaries, extractions,
                or custom analyses.
              </span>
            </Typography>

            <Typography
                variant="body2"
                sx={{ mt: 1, fontSize: 12, lineHeight: 1.6 }}
              >
                You can send multiple follow-up questions as long as the URL
                stays selected.
            </Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* 4. Be aware (limitations / cooldown) */}
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
              <Clock size={25} style={{ marginTop: 2 }} />
              <span>
                Scraping / re-scraping a URL can take <b>hours or even days</b> to
                complete, depending on the size and depth of the website.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <GaugeCircle size={25} style={{ marginTop: 2 }} />
              <span>
                For simplicity and to reduce compute usage, there is a{" "}
                <b>30-day cooldown</b> between re-scrapes of the same URL.
              </span>
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <Globe2 size={20} style={{ marginTop: 2 }} />
              <span>
                Only use <b>public, non-sensitive</b> URLs. Avoid protected, private, or
                classified content.
              </span>
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ mt: 1, fontSize: 12, lineHeight: 1.6 }}
          >
            Once a site has been scraped successfully, it will appear as a preset card
            with its last scraped time and can be reused for chat or downloads.
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
        nextAllowedAt={dialogNextAllowedAt}
      />
    </Paper>
  );
}

export default WebScraper;
