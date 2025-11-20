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
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 2,
        flex: "1 1 100%",
        bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.common.white,
      })}
    >
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
          sx={(theme) => ({
            maxHeight: "70vh",
            overflow: "auto",

            // override GitHub markdown defaults so it follows the Paper
            backgroundColor: "transparent",
            color: theme.palette.text.primary,
            fontSize: 14,

            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: theme.palette.text.primary,
            },
            "& code, & pre": {
              backgroundColor: theme.palette.action.primary,
            },
            "& hr": {
              borderColor: theme.palette.divider,
            },
            "& table, & th, & td": {
              borderColor: theme.palette.divider,
            },
          })}
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
