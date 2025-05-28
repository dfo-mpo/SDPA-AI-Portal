/**
 * Scale Ageing Tool Component
 * 
 * Main component for the Scale Ageing tool, which uses AI to estimate
 * fish age from scale images. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { processScaleAge, convertToPng } from '../../services/apiService';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function ScaleAgeing({ isDemoMode }) {
  const { language } = useLanguage();
  const toolData = getToolTranslations("scaleAgeing", language);
  const scaleAgeingStyles = useComponentStyles('scaleAgeing');
  
  // read the settings from the context
  const { scaleAgeingSettings } = useToolSettings();
  const { species, enhance } = scaleAgeingSettings;

  const [scaleOutput, setScaleOutput] = useState({ age: null, imageUrl: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle file upload and processing
   * 
   * @param {File} inputFile - The file selected by the user
   */
  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true); 
    setError(null);
    
    try {
      // pass the user's picks from context (enhance & species) to backend
      const ageData = await processScaleAge(inputFile, scaleAgeingSettings);
      // Debug the response
      console.log("Full API Response:", ageData);
      console.log("Properties:", Object.keys(ageData));
      console.log("species value:", ageData.species);
      const pngBlob = await convertToPng(inputFile);
      const pngUrl = URL.createObjectURL(new Blob([pngBlob]));
      
      // Set the error if one was returned
      if (ageData.error) {
        setError(ageData.error);
      }
      
      setScaleOutput({ 
        age: ageData.age,
        species: ageData.species || species,
        enhanced: ageData.enhanced || enhance,
        placeholder: ageData.placeholder || false,
        imageUrl: pngUrl 
      });
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the image: ' + error.message);
    } finally {
      setIsProcessing(false); 
    }
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/scales.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      containerSx={scaleAgeingStyles.container}
      isDemoMode={isDemoMode}
    >
      {/* Show any errors */}
      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}
      
      {/* Only render the card if we actually have an age result */}
      {scaleOutput.age !== null && (
        <Box sx={scaleAgeingStyles.resultCard}>
          {/* A sub-container that arranges text lines vertically */}
          <Box sx={scaleAgeingStyles.resultContainer}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Estimated Fish Age: {scaleOutput.age}
            </Typography>
            
            <Typography sx={scaleAgeingStyles.infoLine}>
              Fish Species: {scaleOutput.species}
            </Typography>
            <Typography sx={scaleAgeingStyles.infoLine}>
              Enhanced?: {scaleOutput.enhanced ? "Yes" : "No"}
            </Typography>
            {scaleOutput.placeholder && (
              <Typography sx={scaleAgeingStyles.infoLine}>
                Placeholder?: {scaleOutput.placeholder}
              </Typography>
            )}
          </Box>

          {/* Display the processed image below the text lines */}
          {scaleOutput.imageUrl && (
            <img 
              src={scaleOutput.imageUrl} 
              alt="Processed scale image" 
              style={scaleAgeingStyles.resultImage}
            />
          )}
        </Box>
      )}
    </ToolPage>
  );
}