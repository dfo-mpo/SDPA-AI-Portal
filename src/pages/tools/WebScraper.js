/**
 * Web Scraper
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Stack, Alert, AlertTitle, TextField, Button, Drawer, Divider,
  Typography, Box, Grid, Card, CardActionArea, CardContent, Avatar,
  IconButton, Tooltip, Chip, CircularProgress, InputAdornment, Skeleton,
} from "@mui/material";
import { Search, RefreshCw } from "lucide-react";

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

/* ---------- preset card ---------- */
function PresetCard({ item, onRefresh, refreshing }) {
  const title = item.title || item.site_title;
  const fav = item.favicon
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
      <CardActionArea disableRipple>
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
            <Tooltip title="Refresh (re-scrape)">
              <span>
                <IconButton
                  size="small"
                  onClick={() => onRefresh(item.url)}
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

/* ---------- main component ---------- */
export function WebScraper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { presets, loading, err, reload } = usePresets();
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(() => new Set());
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return presets;
    const needle = q.toLowerCase();
    return presets.filter((p) =>
      (p.title || "").toLowerCase().includes(needle) ||
      (p.description || "").toLowerCase().includes(needle) ||
      (p.url || "").toLowerCase().includes(needle)
    );
  }, [presets, q]);

  const handleRefresh = async (url) => {
    const next = new Set(refreshing); next.add(url); setRefreshing(next);
    try {
      const r = await fetch(`${API_BASE}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      await reload();
    } catch (e) {
    } finally {
      const n2 = new Set(refreshing); n2.delete(url); setRefreshing(n2);
    }
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
    try {
      if (existingKeys.has(urlKeyStrict(q))) {
        setAddErr("This URL was already scraped. Use Refresh to re-scrape.");
        return;
      }
    } catch {
      setAddErr("Invalid URL.");
      return;
    }

    setAdding(true);
    try {
      await fetch(`${API_BASE}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: q.trim() }),
      });
      setQ("");
      await reload();
    } catch {
      setAddErr("Failed to start scraping. Please try again.");
    } finally {
      setAdding(false);
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

      {/* Search Bar */}
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
          sx={{
            textTransform: "none",
            alignSelf: "flex-start",
            "&.Mui-disabled": {
              opacity: 1,
              color: "grey.400",
              WebkitTextFillColor: "unset",
            },
          }}
        >
          {adding ? "Scraping…" : "Add/Scrape"}
        </Button>
      </Box>

      {/* Grid */}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Grid container spacing={2}>
        {filtered.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.url}>
                <PresetCard
                  item={item}
                  onRefresh={handleRefresh}
                  refreshing={refreshing.has(item.url)}
                />
              </Grid>
            ))}
        {!loading && filtered.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              No results. Try a different search or Add/Scrape this website Url.
            </Typography>
          </Grid>
        )}
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