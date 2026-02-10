/**
 * Classification Model Feature (uses an already-built Azure Custom Vision model)
 */

// Imports
import React, { useMemo, useRef, useState, useEffect } from "react";
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
  Drawer, 
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import {
  HelpCircle,
  Upload,
  Sparkles,
  X,
  Image as ImageIcon,
  Bot,
  AlertTriangle,
  ShieldCheck,
  GaugeCircle,
  Layers,
} from "lucide-react";
import { predictWithModel, listClassificationModels } from "../../services/apiService";

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
  const [view, setView] = useState("pick");
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const canPredict = useMemo(() => !!file && !!selectedModelId && !loading, [file, loading, selectedModelId]);
  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError("");
    setLoading(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await listClassificationModels();
        setModels(data.items || []);
      } catch (e) {
        setError(e.message || "Failed to load models");
      }
    })();
  }, []);

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

      const data = await predictWithModel(selectedModelId, file);
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
          Image Classification Model
        </Typography>

        <Typography sx={{ fontSize: 20, mt: 0 }}>
          Upload a photo and get a prediction from the existing models
        </Typography>

        <Typography sx={{ mt: 3 }}>
          This page sends your image to the already-built Azure Custom Vision models and returns a predicted label + confidence.
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
        1) Choose a classification model type. <br />
        2) Upload a single image. <br />
        3) Click <b>Predict</b>. <br />
        4) View the predicted label + confidence.
      </Alert>

      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>

      {/* MAIN STEP AREA */}
      {view === "pick" ? (
        // =========================
        // STEP A: MODEL PICKER ONLY
        // =========================
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1 }}>
            <Typography variant="h5" fontWeight={800}>
              Choose a model
            </Typography>
            <Chip label={`${models.length} available`} variant="outlined" />
          </Box>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {models.map((m) => (
              <Grid item xs={12} sm={6} md={3} key={m.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    transition: "0.15s",
                    borderColor: "divider",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setSelectedModelId(m.id);
                      resetAll();
                      setError("");
                      setView("predict");
                    }}
                    sx={{ height: "100%" }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="overline" color="text.secondary">
                        Model
                      </Typography>

                      <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5, lineHeight: 1.15 }}>
                        {m.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>
                        {m.description || "—"}
                      </Typography>

                      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <Sparkles size={16} />
                        <Typography variant="body2" fontWeight={800}>
                          Select
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {error ? (
            <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          ) : null}
        </Paper>
      ) : (
        // =========================
        // STEP B: UPLOAD + PREDICT ONLY
        // =========================
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
          {/* top bar */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Selected model
              </Typography>
              <Typography variant="h6" fontWeight={900}>
                {models.find((m) => m.id === selectedModelId)?.name || selectedModelId}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={() => {
                setSelectedModelId(null);
                resetAll();
                setView("pick");
              }}
            >
              Back to models
            </Button>
          </Box>

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

            <Button variant="text" startIcon={<X size={18} />} onClick={resetAll} disabled={loading && !file}>
              Clear
            </Button>

            {file?.name ? <Chip label={file.name} variant="outlined" /> : null}
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
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 1.25, borderRadius: 3, height: "100%" }}>
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

              <Grid item xs={12} md={5}>
                {result ? (
                  <Paper sx={{ p: 1.5, borderRadius: 3, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h5" fontWeight={900}>
                        {topLabel ?? "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>
                        {topConf == null ? "—" : `${(topConf * 100).toFixed(1)}%`}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={topConf == null ? 0 : Math.max(0, Math.min(100, topConf * 100))}
                      sx={{ height: 10, borderRadius: 999, mb: 1.25 }}
                    />

                    {preds.length > 0 && (
                      <Stack spacing={1}>
                        {preds.slice(0, 2).map((p) => {
                          const pct = Math.max(0, Math.min(100, Number(p.confidence) * 100));
                          return (
                            <Box
                              key={p.label}
                              sx={{ display: "grid", gridTemplateColumns: "1fr 52px", gap: 1, alignItems: "center" }}
                            >
                              <Typography variant="body2" fontWeight={700}>
                                {p.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
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
                    sx={{ p: 1.5, borderRadius: 3, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
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
      )}

      {/* Help button to open drawer */}
      <Button
        onClick={() => setHelpOpen(true)}
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
          zIndex: 1300,
        }}
        aria-label="Open instructions"
        title="Open instructions"
      >
        <HelpCircle size={18} />
      </Button>

      {/* Drawer / Help Guide */}
      <Drawer
        anchor="right"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        PaperProps={{
          sx: {
            width: 380,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.background.default
                : theme.palette.grey[50],
          },
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

        {/* 0. Choose a model */} 
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          0. Choose a model
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
          Select the <b>classification model type</b> using the model cards (Cat vs Dog, Apple vs Orange, etc.).
          Your prediction will always run on the currently selected model.
        </Typography>

        <Stack spacing={1.1} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Layers size={13} />
            <span>
              Use the <b>model cards</b> to switch between model types.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <GaugeCircle size={15} />
            <span>
              The description in the cards explains what that model is trained to classify.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1, fontSize: 12, lineHeight: 1.6 }}
          >
            Tip: If you change the model after predicting, upload a new image that matches that model’s use-case.
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* 1. Upload & preview */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          1. Upload & preview
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
          Select a single image. A preview is created instantly in your browser.
        </Typography>

        <Stack spacing={1.1} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Upload size={13} />
            <span>
              Click <b>Choose Image</b> to select a file.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ImageIcon size={13} />
            <span>
              You’ll see a <b>preview</b> immediately after selecting the file.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <X size={13} />
            <span>
              Use <b>Clear</b> to reset the selected image + results.
            </span>
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* 2. Predict */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          2. Predict
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1.5 }}>
          When you click <b>Predict</b>, the image is sent to the backend, which calls the
          Azure Custom Vision model and returns a label + confidence.
        </Typography>

        <Stack spacing={1.1} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Sparkles size={13} />
            <span>
              Press <b>Predict</b> to run classification.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Bot size={13} />
            <span>
              Results show the <b>top label</b> and <b>confidence</b>.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1, fontSize: 12, lineHeight: 1.6 }}
          >
            Tip: If confidence is low, try a clearer photo with the animal centered and good lighting.
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* 4. Be aware */}
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
            <ShieldCheck size={22} style={{ marginTop: 2 }} />
            <span>
              Use only <b>public / non-sensitive</b> images. Avoid faces, IDs, medical, or confidential data.
            </span>
          </Typography>

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
          >
            <AlertTriangle size={22} style={{ marginTop: 2 }} />
            <span>
              This is a <b>demo</b> model and can misclassify unusual angles, low-res images, or cluttered backgrounds.
            </span>
          </Typography>
        </Stack>
      </Box>
      </Drawer>
    </Paper>
  );
}

export default ClassificationModel;
