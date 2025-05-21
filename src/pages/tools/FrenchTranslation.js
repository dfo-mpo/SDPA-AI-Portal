/**
 * French Translation Tool Component
 * 
 * Main component for the French Translation tool, which translates English documents
 * to French using AI. This component displays the user interface for the tool,
 * including its description and document upload functionality.
 */

import React, { useState } from 'react';
import { useTheme, Box, Typography, Paper } from '@mui/material';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { frenchTranslationStyles } from '../../styles/componentStyles';
import { translateToFrench } from '../../services/apiService';


export function FrenchTranslation() { 
  const { language } = useLanguage();
  const toolData = getToolTranslations("frenchTranslator", language);
  // const frenchStyles = frenchTranslationStyles; // centralized styles for French Translation
  const frenchStyles = useComponentStyles('frenchTranslation'); // centralized styles for French Translation

  
  
  const [translatedText, setTranslatedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await translateToFrench(inputFile);  
      if (result && result.translation) {
        setTranslatedText(result.translation);
      } else {
        throw new Error('Invalid response format');
      }
    }
    catch (error) {
      console.error('Error:', error);
      setError('An error occurred while translating the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/flag.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      containerSx={frenchStyles.container} // if defined
    >
      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}

      {translatedText && (
        <Box sx={frenchStyles.resultContainer}>
          <Typography variant="h6">French Translation</Typography>
          <Paper sx={frenchStyles.translationPaper}>
            <Typography variant="body1" sx={frenchStyles.translationText}>
              {translatedText}
            </Typography>
          </Paper>
        </Box>
      )}
    </ToolPage>
  );
}
