import {
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Download, History, FileText } from "lucide-react";

function toLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const chipSx = {
  height: 22,
  "& .MuiChip-label": { px: 1, fontWeight: 600, letterSpacing: 0.2 },
};
// slightly smaller chips for the meta row
const chipSxMeta = {
  height: 20,
  "& .MuiChip-label": { px: 0.75, fontWeight: 600, letterSpacing: 0.2 },
};

// rotate through simple, readable colors for tags
const TAG_COLORS = ["success", "info", "secondary", "warning"];
const tagColor = (i) => TAG_COLORS[i % TAG_COLORS.length];

// Main functionality of Model Card
export default function ModelCard({ item, onReadme, onHistory }) {
  const handleDownload = (e) => {
    e.stopPropagation();
    if (item?.downloadUrl) {
      window.location.href = item.downloadUrl;
    }
  };

  // Body of card
  const Body = (
    <CardContent
      sx={{ p: 0.5, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Title + version + TYPE (blue) */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
          title={item?.name}
        >
          {item?.name}
        </Typography>
        <Chip size="small" label={`v${item?.version ?? "?"}`} sx={chipSx} />
        <Chip
          size="small"
          variant="filled"
          color="primary"
          label={(item?.type || "TYPE").toUpperCase()}
          sx={{ ...chipSx, fontWeight: 700 }}
        />
      </Stack>

      {/* Description */}
      {item?.description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={item?.description}
        >
          {item?.description}
        </Typography>
      ) : null}

      <Stack sx={{ mt: "auto", pr: 5 }}>
        {/* Tags */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          useFlexGap
          flexWrap="wrap"
        >
          <Typography variant="caption" color="text.secondary">
            <strong>Tags:</strong>
          </Typography>
          {Array.isArray(item?.tags) && item.tags.length > 0 ? (
            item.tags.map((t, i) => (
              <Chip
                key={t}
                size="small"
                variant="filled"
                color={tagColor(i)}
                label={t}
                sx={chipSxMeta}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              N/A
            </Typography>
          )}
        </Stack>

        {/* Flavours*/}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 0.25 }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>Flavors:</strong>
          </Typography>
          {Array.isArray(item?.flavors) && item.flavors.length > 0 ? (
            item.flavors.map((f) => (
              <Chip
                key={f}
                size="small"
                variant="outlined"
                label={f}
                sx={chipSxMeta}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              N/A
            </Typography>
          )}
        </Stack>

          {/* Created and Last Modified dates */}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
          <strong>Created:</strong> {toLocal(item?.createdOn) || "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
          <strong>Updated:</strong> {toLocal(item?.lastUpdatedOn) || "—"}
        </Typography>
      </Stack>

        {/* History + Download buttons (bottom right) */}
        <span
          style={{
            position: "absolute",
            right: 15,
            bottom: 15,
            display: "inline-flex",
            gap: 4,
          }}
        >
          {/* README Button (only if onClick is provided) */}
          {onReadme && (
            <Tooltip title="Open README & details">
              <IconButton
                size="small"
                aria-label="Open README & details"
                onClick={(e) => {
                  e.stopPropagation();
                  onReadme();
                }}
              >
                <FileText size={18} />
              </IconButton>
            </Tooltip>
          )}
          {/* History Button */}
          <Tooltip title="View version history">
            <IconButton
              size="small"
              aria-label="View version history"
              onClick={(e) => {
                e.stopPropagation();
                if (onHistory) onHistory(item);
              }}
            >
              <History size={18} />
            </IconButton>
          </Tooltip>

          {/* Download Button */}
          <Tooltip title={item?.downloadUrl ? "Download ZIP" : "No downloadable artifact"}>
            <span>
              <IconButton
                onClick={handleDownload}
                disabled={!item?.downloadUrl}
                size="small"
                sx={{
                  bgcolor: (t) =>
                    item?.downloadUrl ? t.palette.background.paper : "transparent",
                  border: (t) =>
                    item?.downloadUrl ? `1px solid ${t.palette.divider}` : "none",
                  "&:hover": {
                    bgcolor: (t) =>
                      item?.downloadUrl ? t.palette.action.hover : "transparent",
                  },
                }}
                aria-label="Download ZIP"
              >
                <Download size={18} />
              </IconButton>
            </span>
          </Tooltip>
        </span>

    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 200,
        boxSizing: "border-box",
        borderRadius: 2,
        transition: "box-shadow 120ms ease, transform 120ms ease",
      }}
    >
      {Body}
    </Card>
  );
}
