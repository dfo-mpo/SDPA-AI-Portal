import React from "react";
import { Card, CardContent, Stack, Typography, Chip, Checkbox } from "@mui/material";

export default function ModelCard({ item, onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",       // fill the grid cell
        height: "100%",
        minHeight: 180,      // keep a nice rectangle
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {item.name}
          </Typography>
          <Chip size="small" label={item.private ? "Private" : "Public"} sx={{ ml: "auto" }} />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {item.description}
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {(item.tags || []).slice(0, 4).map((t) => (
            <Chip key={t} size="small" label={t} />
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          v{item.version} • {item.updatedAt} • {item.sizeMB ?? 0} MB • {item.downloads} downloads
        </Typography>
      </CardContent>
    </Card>
  );
}
