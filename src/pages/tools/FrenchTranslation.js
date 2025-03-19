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
// Assume you have a dedicated style object for French Translation:
import { frenchTranslationStyles } from '../../styles/componentStyles';

export function FrenchTranslation() {
  const { language } = useLanguage();
  const theme = useTheme();
  const toolData = getToolTranslations("frenchTranslator", language);
  const styles = frenchTranslationStyles; // centralized styles for French Translation
  
  const [translatedText, setTranslatedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();  
      formData.append('file', inputFile);  
      
      const response = await fetch('http://localhost:8080/pdf_to_french/', {  
        method: 'POST',  
        body: formData  
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();  
      if (data && data.translation) {
        setTranslatedText(data.translation);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the PDF.');  
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
      containerSx={styles.container} // if defined
    >
      {translatedText && (
        <Box sx={styles.resultContainer}>
          <Typography variant="h6">French Translation</Typography>
          <Paper sx={styles.translationPaper}>
            <Typography variant="body1" sx={styles.translationText}>
              {translatedText}
            </Typography>
          </Paper>
        </Box>
      )}
    </ToolPage>
  );
}
