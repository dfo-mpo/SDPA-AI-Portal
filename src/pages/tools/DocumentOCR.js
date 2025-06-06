/**
 * Document OCR Tool Component (Stub)
 * 
 * Placeholder component for the Document OCR tool which is currently in development.
 * This component will be implemented in the future to provide OCR functionality.
 */

import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { FileSearch } from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function DocumentOCR({ isDemoMode }) {
  const { language } = useLanguage();
  // This will need translations added when implementing
  const toolData = {
    title: language === 'en' ? "Optical Character Recognition" : "Reconnaissance Optique de Caractères",
    shortDescription: language === 'en' 
      ? "Coming Soon..." 
      : "Bientôt...",
    longDescription: language === 'en'
      ? "Technology that digitizes printed or handwritten text for automated data extraction, editing, searchability, and improving data management efficiency."
      : "Technologie qui numérise les textes imprimés ou manuscrits en vue de l'extraction automatisée de données, de l'édition, de la recherche et de l'amélioration de l'efficacité de la gestion des données.",
    actionButtonText: language === 'en' ? "Coming Soon" : "Bientôt Disponible"
  };
  
  const styles = useComponentStyles('tool');

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/OCR.gif"
      actionButtonText={toolData.actionButtonText || "Upload"}
      onFileSelected={() => {/* Will be implemented in the future */}}
      isProcessing={false}
      hideActionButton={true}
      inProgress={true}
      containerSx={styles.container}
      isDemoMode={isDemoMode}
    >
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mt: 2,
          mb: 2,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FileSearch size={24} style={{ marginRight: '8px', opacity: 0.7 }} />
          <Typography variant="h6">
            {language === 'en' ? "Feature In Development" : "Fonctionnalité en développement"}
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          {language === 'en' 
            ? "This feature is currently in development and will be available soon." 
            : "Cette fonctionnalité est en cours de développement et sera bientôt disponible."}
        </Alert>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ 
            color: theme => theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
            fontWeight: 500
          }}>
            {language === 'en' ? "Key Features:" : "Fonctionnalités clés:"}
          </Typography>
          
          <Box component="ul" sx={{ mt: 1, pl: 3 }}>
            <Typography component="li" variant="body2">
              {language === 'en' 
                ? "Digitize printed documents" 
                : "Numériser des documents imprimés"}
            </Typography>
            <Typography component="li" variant="body2">
              {language === 'en' 
                ? "Convert handwritten text to digital text" 
                : "Convertir du texte manuscrit en texte numérique"}
            </Typography>
            <Typography component="li" variant="body2">
              {language === 'en' 
                ? "Enable searchability within documents" 
                : "Permettre la recherche dans les documents"}
            </Typography>
            <Typography component="li" variant="body2">
              {language === 'en' 
                ? "Improve data management efficiency" 
                : "Améliorer l'efficacité de la gestion des données"}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </ToolPage>
  );
}

export default DocumentOCR;