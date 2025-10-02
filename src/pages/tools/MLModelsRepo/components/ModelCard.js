import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";

export default function ModelCard({ item, onClick }) {
  const status = item.private ? "Private" : "Public";
  const statusColor = item.private ? "error" : "success";

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 180,
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 120ms ease, transform 120ms ease",
        "&:hover": onClick
          ? { boxShadow: 3, transform: "translateY(-1px)" }
          : undefined,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "70%",
            }}
            title={item.name}
          >
            {item.name}
          </Typography>
          <Chip size="small" color={statusColor} variant="outlined" label={status} sx={{ ml: "auto" }} />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={item.description}
        >
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
