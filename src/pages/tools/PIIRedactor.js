import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Chip } from '@mui/material';
import { Download, Shield } from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useFileUpload } from '../../hooks/useFileUpload';
import { redactPII } from '../../services/apiService';
import { PIIRedactorSettings } from '../../components/tools/settings';

export function PIIRedactor({ isDemoMode }) {
  const { language } = useLanguage();
  const toolData = getToolTranslations("piiRedactor", language);
  const translations = toolData?.settings; // Get settings translations from toolData
  const { piiRedactorSettings } = useToolSettings();
  
  // Use centralized style hooks
  const styles = useComponentStyles('piiRedactor');
  
  // Keep track of previous settings for change detection
  const [prevSettings, setPrevSettings] = useState(null);
  
  // State for tracking the download URL after processing
  const [downloadURL, setDownloadURL] = useState(null);
  const [fileName, setFileName] = useState(null);
  
  // Flag to force component to completely reset
  const [isReset, setIsReset] = useState(false);
  
  // Use new instance of useFileUpload after reset
  // The key forces a complete re-initialization of the hook
  const instanceKey = isReset ? 'reset' : 'initial';
  
  const { 
    isProcessing, 
    error, 
    handleFileSelected,
    resetFileInput,
    uploadKey
  } = useFileUpload({
    key: instanceKey, // This helps recreate the hook instance
    processFile: async (file) => {
      setFileName(file.name);
      
      try {
        console.log("Processing file with settings:", piiRedactorSettings);
        // Store current settings for change detection
        setPrevSettings(JSON.parse(JSON.stringify(piiRedactorSettings))); // Deep clone
        
        // Call the API service to process the file
        const blob = await redactPII(file, piiRedactorSettings);
        
        // Create a URL for the returned blob
        const url = URL.createObjectURL(blob);
        setDownloadURL(url);
        return url;
      } catch (err) {
        console.error("Error during PII redaction:", err);
        throw err;
      }
    },
    onSuccess: (result) => {
      console.log("File successfully processed, result URL:", result);
    },
    onError: (err) => {
      console.error('Error processing file:', err);
    }
  });
  
  // Monitor settings changes - reset state when any setting changes
  useEffect(() => {
    // Only check if we have previous settings and a current result
    if (prevSettings && downloadURL) {
      // Check if any setting has changed
      const methodChanged = prevSettings.redactionMethod !== piiRedactorSettings.redactionMethod;
      const colorChanged = prevSettings.redactionColor !== piiRedactorSettings.redactionColor;
      const sensitivityChanged = prevSettings.detectionSensitivity !== piiRedactorSettings.detectionSensitivity;
      
      // Check if categories changed
      let categoriesChanged = false;
      if (prevSettings.categories && piiRedactorSettings.categories) {
        for (const category in piiRedactorSettings.categories) {
          if (prevSettings.categories[category]?.enabled !== piiRedactorSettings.categories[category]?.enabled) {
            categoriesChanged = true;
            break;
          }
        }
      }
      
      // If anything changed, reset the component
      if (methodChanged || colorChanged || sensitivityChanged || categoriesChanged) {
        console.log("Settings changed - resetting state");
        handleReset();
      }
    }
  }, [piiRedactorSettings, prevSettings, downloadURL]);
  
  /**
   * Reset the component state to return to the upload screen
   */
  const handleReset = () => {
    // Clean up URL if it exists
    if (downloadURL) {
      URL.revokeObjectURL(downloadURL);
    }
    
    // Reset component state
    setDownloadURL(null);
    setFileName(null);
    setPrevSettings(null);
    
    // Reset the file input to allow uploading the same file again
    resetFileInput();
    
    // Force a complete hook reset
    setIsReset(prev => !prev);
    
    console.log("Component state fully reset, returning to upload screen");
  };

  /**
   * Get active categories for the results display
   */
  const getActiveCategories = () => {
    if (!piiRedactorSettings.categories) return [];
    
    return Object.entries(piiRedactorSettings.categories)
      .filter(([_, info]) => info.enabled)
      .map(([category]) => category);
  };

  return (
    <ToolPage
      title={toolData.title || "PII Redactor"}
      shortDescription={toolData.shortDescription || "Redact personal information from documents"}
      longDescription={toolData.longDescription || "Upload a document to automatically detect and redact sensitive personal information."}
      backgroundImage="/assets/lock.png"
      actionButtonText={toolData.actionButtonText || "Upload PDF"}
      onFileSelected={(file) => {
        console.log("File selected via ToolPage button with key:", uploadKey);
        handleFileSelected(file);
      }}
      settingsComponent={<PIIRedactorSettings />}
      hideActionButton={!!downloadURL} // Hide the button when we have results
      uploadKey={uploadKey} // Pass the key to ensure ToolPage resets too
      isDemoMode={isDemoMode}
    >
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "An error occurred while processing the file. Please try again."}
        </Alert>
      )}
      
      {/* Loading Display */}
      {isProcessing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Redacting personal information, please wait...
          </Typography>
        </Box>
      )}
      
      {/* Result Display */}
      {downloadURL && !isProcessing && (
        <Box sx={styles.resultContainer || { mt: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={styles.successHeader || { display: 'flex', alignItems: 'center', mb: 2 }}>
            <Shield size={24} style={{ color: '#4caf50', marginRight: '8px' }} />
            <Typography variant="h6">Your document has been redacted</Typography>
          </Box>
          
          <Box sx={styles.resultDetails || { mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Personal information has been redacted from your document.
              The following information types were processed:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {/* Display active categories with descriptions */}
              {piiRedactorSettings.categories && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(piiRedactorSettings.categories)
                    .filter(([_, info]) => info.enabled)
                    .map(([category, info]) => (
                      <Chip 
                        key={category}
                        label={translations?.categories?.[category] || category.replace(/_/g, ' ')}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    ))
                  }
                </Box>
              )}
              
              {/* Show fallback display for legacy entity format */}
              {!piiRedactorSettings.categories && piiRedactorSettings.entities && (
                <Box sx={styles.entityList || { display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {Object.entries(piiRedactorSettings.entities)
                    .filter(([_, enabled]) => enabled)
                    .map(([entity]) => (
                      <Box key={entity} sx={styles.entityItem || { px: 2, py: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                        <Typography variant="body2">
                          {entity.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    ))
                  }
                </Box>
              )}
            </Box>
            
            {/* Display detection and redaction method settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Redaction method:</strong> {piiRedactorSettings.redactionMethod === 'mask' 
                  ? `Mask with color (${piiRedactorSettings.redactionColor})` 
                  : 'TYPE placeholders with black background'
                }
              </Typography>
              
              {piiRedactorSettings.detectionSensitivity !== undefined && (
                <Typography variant="body2">
                  <strong>Detection sensitivity:</strong> {
                    piiRedactorSettings.detectionSensitivity <= 3 ? 'Conservative' :
                    piiRedactorSettings.detectionSensitivity <= 7 ? 'Balanced' : 'Aggressive'
                  } ({piiRedactorSettings.detectionSensitivity}/10)
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={styles.actionButtons || { display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleReset}
            >
              Process Another Document
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              component="a" 
              href={downloadURL} 
              download={`redacted_${fileName}`}
              startIcon={<Download size={16} />}
            >
              Download Redacted PDF
            </Button>
          </Box>
        </Box>
      )}
    </ToolPage>
  );
}

export default PIIRedactor;