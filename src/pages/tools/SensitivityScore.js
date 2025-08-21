/**
 * Sensitivity Score Tool Component
 * 
 * Main component for the Sensitivity Score Calculator tool, which analyzes
 * documents for sensitive content and calculates a sensitivity score.
 * This component uses the useFileUpload hook to handle file operations.
 */
import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { calculateSensitivityScore } from '../../services/apiService';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useIsAuthenticated } from '@azure/msal-react';

export function SensitivityScore() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("sensitivityScore", language);
  const sensitivityScoreStyles = useComponentStyles('sensitivityScore');
  const isAuth = useIsAuthenticated();

  // Use the settings from context
  const { sensitivityScoreSettings } = useToolSettings();
  
  // State for the sensitivity score result
  const [score, setScore] = useState(null);
  
  // Calculate if the current weights are valid (only matters in advanced mode)
  const totalWeight = Object.values(sensitivityScoreSettings.weights).reduce((sum, weight) => sum + weight, 0);
  const isWeightValid = totalWeight === 100;
  
  // Only validate if in advanced mode
  const isFormValid = !sensitivityScoreSettings.showAdvanced || isWeightValid;
  
  // Create a validation message when weights are invalid
  const validationMessage = sensitivityScoreSettings.showAdvanced && !isWeightValid 
    ? (`Weights add up to ${totalWeight}%, must be exactly 100%`)   //TODO: translate to the current language
    : '';
  
  /**
   * Process the uploaded file
   * This function is passed to the useFileUpload hook
   */
  const processFile = useCallback(async (file) => {
    // First, validate that weights add up to 100% if in advanced mode
    if (sensitivityScoreSettings.showAdvanced) {
      const totalWeight = Object.values(sensitivityScoreSettings.weights).reduce((sum, weight) => sum + weight, 0);
      
      // Use strict equality check (===) to ensure exactly 100%
      if (totalWeight !== 100) {
        // Throw a specific error that will be caught by the useFileUpload hook
        throw new Error('WEIGHT_VALIDATION_ERROR');
      }
    }
    
    // Pass settings to the API
    const response = await calculateSensitivityScore(file, sensitivityScoreSettings);
    
    if (response && typeof response.sensitivity_score === 'number') {
      // Set the score state with the result
      setScore(response.sensitivity_score);
      return response;
    } else {
      throw new Error('Invalid response format from sensitivity score service');
    }
  }, [sensitivityScoreSettings]);

  // Use the file upload hook to handle file operations
  const { 
    isProcessing, 
    uploadKey, 
    handleFileSelected,
  } = useFileUpload({
    processFile,
    onError: (err) => {
      // Check if this is a weights validation error (using our specific error code)
      if (err.message === 'WEIGHT_VALIDATION_ERROR') {
        // Use a clearer, more specific message
        alert('Please ensure category weights add up to exactly 100% before uploading a document.');
        
        // No need to log this expected error
        return;
      } 
      
      // Generic error handling for other errors
      console.error('Failed to process sensitivity score:', err);
      alert('An error occurred while analyzing the document.');
    },
    // Prevent the default error from being thrown up to React
    // This should prevent the "Uncaught runtime error" at the top
    rethrowErrors: false
  });

  /**
   * Get color for the score based on its value
   * 
   * @param {number} score - The sensitivity score
   * @returns {string} - The color code
   */
  const getScoreColor = (score) => {
    if (score < 25) return '#4caf50';
    if (score < 50) return '#ff9800';
    if (score < 75) return '#f57c00';
    return '#d32f2f';
  };

  /**
   * Get description for the score based on its value
   * 
   * @param {number} score - The sensitivity score
   * @returns {string} - Description text
   */
  const getScoreDescription = (score) => {
    if (score < 25) {
      return "Low sensitivity: This document contains minimal sensitive information.";
    } else if (score < 50) {
      return "Medium sensitivity: This document contains some sensitive information that may require protection.";
    } else if (score < 75) {
      return "High sensitivity: This document contains significant sensitive information. Handle with care.";
    } else {
      return "Very high sensitivity: This document contains critical sensitive information and should be handled with strict confidentiality protocols.";
    }
  };

  return (
    <ToolPage
      // Use the uploadKey to force re-creation of the file input when needed
      key={uploadKey}
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/calculations.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      isFormValid={isFormValid}
      validationMessage={validationMessage}
      containerSx={sensitivityScoreStyles.container}
    >
      {score !== null && (
        <Box sx={sensitivityScoreStyles.resultContainer}>
          <Typography variant="h6">Sensitivity Analysis Result</Typography>
          <Paper sx={sensitivityScoreStyles.scorePaper || {}}>
            <Typography 
              variant="h4" 
              sx={sensitivityScoreStyles.scoreValue || {}} 
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(1)}%
            </Typography>
            
            <Box sx={sensitivityScoreStyles.progressContainer || {}}>
              <LinearProgress 
                variant="determinate" 
                value={score} 
                sx={{
                  ...(sensitivityScoreStyles.progress || {}),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(score)
                  }
                }}
              />
            </Box>
            
            <Typography variant="body1" sx={sensitivityScoreStyles.description || {}}>
              {getScoreDescription(score)}
            </Typography>
          </Paper>
        </Box>
      )}
    </ToolPage>
  );
}

export default SensitivityScore;