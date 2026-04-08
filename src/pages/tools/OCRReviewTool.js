/**
 * OCR Review Tool Component
 * 
 * Page provides context and a link to a OCR Review Tool allowing users to correct mistakes made by Azure Document Intelligence when extracting document content.
 */

import React from 'react';
import { Paper, Stack, Alert, AlertTitle, Box, Card, CardActionArea, CardMedia, CardContent } from "@mui/material";
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useIsAuthenticated } from '@azure/msal-react';

export function OCRReviewTool() {
  const { language } = useLanguage();
  const isAuth = useIsAuthenticated();

  const toolData = getToolTranslations("ocrReviewTool", language)
  const styles = useComponentStyles('tool');

  /* UI */
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
      <Stack sx={{ mb: 1 }}>
        <p style={{ fontSize: 50, fontWeight: 600, marginTop: 30 }}>{toolData.title}</p>
        <p style={{ fontSize: 20, marginTop: 0 }}>{toolData.subtitle}</p>
        <p style={{ marginTop: 20 }}>{toolData.body?.firstParagraph}<br></br>{toolData.body?.secondParagraph}</p>
      </Stack>

      {/* Disclaimer banner */}
      <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
        <AlertTitle>{toolData.alertTitle}</AlertTitle>
        {toolData.alertBody?.part1}<strong>{toolData.alertBody?.part2}</strong>{toolData.alertBody?.part3}
        <strong>{toolData.alertBody?.part4}</strong>{toolData.alertBody?.part5}<strong>{toolData.alertBody?.part6}</strong>
        {toolData.alertBody?.part7}<strong>{toolData.alertBody?.part8}</strong>.
      </Alert>

      <Box sx={{ mt: 4 }} />

      {/* Content Section */}
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Card style={{padding: '0px'}}>
          <CardActionArea href='https://review-validation-demo-tool.azurewebsites.net/' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <CardMedia
              // className={classes.cover}
              image="/assets/ocr_webpage.png"
              title="OCR Review Tool"
              style={{height: '100px', width: '200px'}}
            />
            <CardContent style={{marginRight: '9%', marginLeft: '15px'}}>
              {toolData.cardBody}
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Paper>
  );
}

export default OCRReviewTool;