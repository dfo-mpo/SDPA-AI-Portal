import React from "react";
import { Box, Chip, Stack, Typography, Divider } from "@mui/material";

export default function ModelDetail({ model }) {
  if (!model) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {model.name} <Typography component="span" variant="body2">v{model.version}</Typography>
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
        {(model.tags || []).map((t) => <Chip key={t} size="small" label={t} />)}
        <Chip size="small" label={model.private ? "Private" : "Public"} />
      </Stack>

      <Typography variant="body1" sx={{ mb: 2 }}>{model.description}</Typography>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>README</Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
        {model.readme || "No README provided yet."}
      </Typography>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>SDK Usage</Typography>

      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Python</Typography>
      <pre style={{ overflowX: "auto", padding: 12, background: "#0f172a", color: "white", borderRadius: 8 }}>
{`from dfo_ml import load_model

m = load_model("${model.id}", version="${model.version}")
pred = m.predict(data)`}
      </pre>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>REST</Typography>
      <pre style={{ overflowX: "auto", padding: 12, background: "#0f172a", color: "white", borderRadius: 8 }}>
{`POST /api/models/${model.id}/v/${model.version}/predict
Authorization: Bearer <token>
Content-Type: application/json

{"inputs": {...}}`}
      </pre>
    </Box>
  );
}
