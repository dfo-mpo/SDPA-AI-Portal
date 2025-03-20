/**
 * PII Redactor Tool Component
 * 
 * Main component for the PII Redactor tool, which automatically identifies
 * and redacts personal information from documents. This component displays
 * the user interface for the tool, including its description and upload functionality.
 */

import React, { useState } from 'react';
import { useTheme, Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { piiRedactorStyles } from '../../styles/componentStyles';

export function PIIRedactor() {
  const { language } = useLanguage();
  const theme = useTheme();
  const toolData = getToolTranslations("piiRedactor", language);
  const styles = piiRedactorStyles;
  const [downloadURL, setDownloadURL] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle file upload and processing
   * 
   * @param {File} inputFile - The file selected by the user
   */
  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true);
    setFileName(inputFile.name);

    const formData = new FormData();  
    formData.append('file', inputFile);  
  
    try {  
      const response = await axios.post('http://localhost:8080/pii_redact/', formData, {  
        responseType: 'blob',
      });  
  
      if (response.status === 200) {  
        const url = window.URL.createObjectURL(new Blob([response.data]));  
        setDownloadURL(url); 
      } else {  
        console.error('Failed to download the redacted PDF');  
        alert('Failed to download the redacted PDF');  
      }  
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the file.');  
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/lock.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      containerSx={styles.container} // if defined in your piiRedactorStyles
    >
      {downloadURL && (
        <Box sx={styles.resultContainer}>
          <Typography variant="h6">Your document has been redacted</Typography>
          <Button 
            variant="contained" 
            component="a" 
            href={downloadURL} 
            download={`redacted_${fileName}`}
            sx={styles.downloadButton}
          >
            Download Redacted PDF
          </Button>
        </Box>
      )}
    </ToolPage>
  );
}
