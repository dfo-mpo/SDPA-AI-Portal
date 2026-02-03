/**
 * Dog vs Cat Predictor (uses an already-built Azure Custom Vision model)
 */

// Imports
import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Stack,
  Alert,
  AlertTitle,
  Paper,
  Typography,
  Button,
  Divider,
  LinearProgress,
  Chip,
  Grid,
} from "@mui/material";
import { Upload, Sparkles, X } from "lucide-react";
import { predictCatDog } from "../../services/apiService"; // adjust path

// Global Variable
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp"];

// Main function
export function ClassificationModel() {
  // hooks + states + refs
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const canPredict = useMemo(() => !!file && !loading, [file, loading]);
  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError("");
    setLoading(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // helper function for file input
  const onPickFile = (f) => {
    setError("");
    setResult(null);

    // error checking
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Please upload a valid image (.jpg, .png, .webp, .bmp).");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("File too large. Please upload an image under 8MB.");
      return;
    }

    // cleanup old preview and show preview of new image
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  // helper function when input image changes
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    onPickFile(f);
  };

  // helper function that calls predictCatDog endpoint in apiService.js
  const handlePredict = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await predictCatDog(file);
      setResult(data);
    } catch (e) {
      setError(e.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  // result variables shown to user
  const topLabel = result?.label ?? null;
  const topConf = typeof result?.confidence === "number" ? result.confidence : null;
  const preds = Array.isArray(result?.predictions) ? result.predictions : [];

  // Actual UI 
  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 1, md: 2 },
        mx: "auto",
        my: 2,
        maxWidth: 1320,
        borderRadius: 3,
        bgcolor: (theme) => theme.palette.background.paper,
      }}
    >
      {/* Header / Hero */}
      <Stack sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 50, fontWeight: 600, mt: 3 }}>
          Dog vs Cat Predictor
        </Typography>

        <Typography sx={{ fontSize: 20, mt: 0 }}>
          Upload a photo and get a prediction from the existing model
        </Typography>

        <Typography sx={{ mt: 3 }}>
          This page sends your image to the already-built Azure Custom Vision model and returns a predicted label + confidence.
        </Typography>
      </Stack>

      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>

      {/* Disclaimer */}
      <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>Disclaimer</AlertTitle>
        Use <strong>ONLY public / non-sensitive images</strong>. Do not upload
        protected, private, confidential, or personal data (including faces,
        IDs, medical info, or any proprietary datasets). This tool is for{" "}
        <strong>demo/learning purposes</strong> and provides{" "}
        <strong>no production guarantees</strong>.
      </Alert>

      {/* How it works */}
      <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
        <AlertTitle>How it works</AlertTitle>
        1) Upload a single image (cat or dog). <br />
        2) Click <b>Predict</b>. <br />
        3) View the predicted label + confidence.
      </Alert>

      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>

      {/* Upload + Predict Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : theme.palette.grey[50],
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Upload an Image
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Supported: JPG, PNG, WEBP, BMP. Max size: 8MB.
        </Typography>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Choose Image
          </Button>

          <Button
            variant="outlined"
            startIcon={<Sparkles size={18} />}
            onClick={handlePredict}
            disabled={!canPredict}
          >
            Predict
          </Button>

          <Button
            variant="text"
            startIcon={<X size={18} />}
            onClick={resetAll}
            disabled={loading && !file}
          >
            Clear
          </Button>

          {file?.name ? (
            <Chip label={file.name} variant="outlined" sx={{ ml: 1 }} />
          ) : null}
        </Box>

        {loading ? (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Predicting…
            </Typography>
          </Box>
        ) : null}

        {error ? (
          <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : null}

        {/* Preview + Results */}
        {(previewUrl || result) && (
          <Grid container spacing={2} sx={{ mt: 0.5, alignItems: "stretch" }}>
            {/* LEFT: Preview */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  height: "100%",
                }}
              >
                {/* Only shown when we have an image but no results yet */}
                {previewUrl && !result && !loading && (
                  <Typography variant="body2" color="text.secondary">
                    Click <b>Predict</b> to see results.
                  </Typography>
                )}
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="preview"
                    sx={{
                      width: "100%",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "block",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Choose an image to preview.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* RIGHT: Results */}
            <Grid item xs={12} md={5}>
              {result ? (
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Prediction
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                        {topLabel ?? "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right", minWidth: 90 }}>
                      <Typography variant="overline" color="text.secondary">
                        Confidence
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {topConf == null ? "—" : `${(topConf * 100).toFixed(1)}%`}
                      </Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={topConf == null ? 0 : Math.max(0, Math.min(100, topConf * 100))}
                    sx={{ height: 10, borderRadius: 999, mb: 1.5 }}
                  />

                  {preds.length > 0 && (
                    <Stack spacing={1}>
                      {preds.slice(0, 2).map((p) => {
                        const pct = Math.max(0, Math.min(100, Number(p.confidence) * 100));
                        return (
                          <Box
                            key={p.label}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "70px 1fr 44px",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {p.label}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ height: 8, borderRadius: 999 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textAlign: "right" }}
                            >
                              {pct.toFixed(0)}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No results yet.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>
    </Paper>
  );
}

export default ClassificationModel;
