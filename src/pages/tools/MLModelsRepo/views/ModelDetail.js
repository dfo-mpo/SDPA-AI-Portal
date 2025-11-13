// views/ModelDetail.js
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getAmlReadme } from "../services/repoApi";
import "github-markdown-css/github-markdown.css";

export default function ModelDetail({ name, version }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAmlReadme(name, version);
      setData(res);
    } catch (e) {
      console.error("Failed to load README", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [name, version]);

  useEffect(() => {
    load();
  }, [load]);

  const hasReadme = Boolean(data && data.content);

  return (
    <Paper sx={{ p: 2, flex: "1 1 100%" }}>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Stack>
      ) : !hasReadme ? (
        <Typography variant="body2" color="text.secondary">
          No README available
        </Typography>
      ) : (
        <Box
          className="markdown-body"
          sx={{
            maxHeight: "70vh",
            overflow: "auto",
            "&.markdown-body": { fontSize: "14px" },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            skipHtml={false}
          >
            {data.content}
          </ReactMarkdown>
        </Box>
      )}
    </Paper>
  );
}
