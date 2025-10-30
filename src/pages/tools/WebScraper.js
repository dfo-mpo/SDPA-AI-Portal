/**
 * Web Scraper
 */

import React, { useState } from "react";
import {
  Paper,
  Stack,
  Alert,
  AlertTitle,
  TextField,
  Button,
  Drawer,
  Divider,
  Typography,
  Box,
} from "@mui/material";

export function WebScraper() {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <p style={{ marginTop: 60 }}>
            This tool allows users to input a website URL and automatically scrape its contents for
            structured data extraction. Once scraped, users can ask questions about the page using
            OpenAI-powered analysis. Ideal for quick insights, research, or prototyping, this scraper
            simplifies the process of turning raw web content into actionable answers.
          </p>
        </Stack>

        {/* Disclaimer banner */}
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Disclaimer</AlertTitle>
          This scraper is for <strong>demonstration purposes only</strong> and is{" "}
          <strong>not</strong> an enterprise solution. Use only{" "}
          <strong>publicly accessible URLs</strong> and avoid scraping protected, sensitive, or
          classified content. The tool is intended for educational and exploratory use with{" "}
          <strong>no production guarantees</strong>. Scraper may take <strong>several hours</strong> to
          complete based on the URL. By proceeding, you confirm you have the right to access and analyze the content you provide.
        </Alert>

        {/* URL input + Scrape button*/}
        <Box
          sx={{
            mt: 2,
            mx: "auto",
            maxWidth: 720,
            display: "flex",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            label="Enter Website URL"
            placeholder="https://example.com"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
          >
            Scrape
          </Button>
        </Box>

          {/* Prompt input + Parse button */}
        <Box
          sx={{
            mt: 2,
            mx: "auto",
            maxWidth: 720,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <TextField
            size="small"
            label="Ask a question or describe what to extract"
            placeholder="e.g., Extract a table with columns: Name | Title | City..."
            fullWidth
            multiline
            minRows={5}
            sx={{
              '& .MuiInputBase-root': {
                height: 125,
                alignItems: "flex-start",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
          >
            Parse
          </Button>
        </Box>
        
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
        {"<"}
      </Button>

      {/* Right sliding instructions drawer */}
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
            <Typography variant="h4" fontWeight={700}>
              How to Use
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setDrawerOpen(false)}
              sx={{ textTransform: "none" }}
            >
              {">"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5}}>
            Steps
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            <b>1.</b> Enter a URL you wish to scrape.
            <br/><b>2.</b> Click <b>Parse</b> button.
            <br/><b>3.</b> Wait until scraper is finished scraping.
            <br/><b>4.</b> Ask questions about the data scraped.
            <br/><b>5.</b> Click <b>Parse</b> button and wait for response.
            <br/><b>6.</b> Wait for a response.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={700}>
            Example Prompts
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            • “Return the single <b>name</b> with the <b>highest salary</b>.”
            <br />• “List all <b>emails</b> found on the page, one per line.”
            <br />• “Extract a <b>table</b> with columns: Name | Title | City.”
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={700}>
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
