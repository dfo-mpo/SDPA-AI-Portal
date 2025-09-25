// src/pages/tools/MLModelsRepo/views/mdComponents.js
import { Box, Typography } from "@mui/material";

export const mdComponents = {
  h1: (p) => <Typography variant="h4" sx={{ mt: 1.5, mb: 1 }} {...p} />,
  h2: (p) => <Typography variant="h5" sx={{ mt: 2, mb: 1 }} {...p} />,
  h3: (p) => <Typography variant="h6" sx={{ mt: 2, mb: 1 }} {...p} />,
  p:  (p) => <Typography sx={{ mb: 1 }} {...p} />,
  li: (p) => <li style={{ marginBottom: 6 }} {...p} />,
  code: ({ inline, ...p }) =>
    inline ? (
      <code style={{ padding: "0 4px", borderRadius: 4, background: "rgba(0,0,0,.07)" }} {...p} />
    ) : (
      <Box component="pre" sx={{
        p: 1.5, overflow: "auto", borderRadius: 2,
        background: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"
      }}>
        <code {...p} />
      </Box>
    ),
  table: (p) => <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", my: 1 }} {...p} />,
  th: (p) => <Box component="th" sx={{ textAlign: "left", borderBottom: "1px solid", borderColor: "divider", py: 0.5, pr: 2 }} {...p} />,
  td: (p) => <Box component="td" sx={{ borderBottom: "1px solid", borderColor: "divider", py: 0.75, pr: 2 }} {...p} />,
  a:  (p) => <a {...p} style={{ textDecoration: "underline" }}>{p.children}</a>,
};
