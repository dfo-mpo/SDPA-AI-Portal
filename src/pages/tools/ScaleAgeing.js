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

export function ScaleAgeing() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("scaleAgeing", language);
  const scaleAgeingStyles = useComponentStyles('scaleAgeing');
  
  // read the settings from the context
  const { scaleAgeingSettings } = useToolSettings();
  const { fishType, enhance } = scaleAgeingSettings;


  const [scaleOutput, setScaleOutput] = useState({ age: null, imageUrl: null });
  const [isProcessing, setIsProcessing] = useState(false);
  // const [enhance, setEnhance] = useState(false);
  // const [fishType, setFishType] = useState("Chum");

  /**
   * Handle file upload and processing
   * 
   * @param {File} inputFile - The file selected by the user
   */
  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true);
    
    try {
      // pass the user’s picks from context (enhance & species) to backend
      const ageData = await processScaleAge(inputFile, enhance, fishType);
      const pngBlob = await convertToPng(inputFile);
      const pngUrl = URL.createObjectURL(new Blob([pngBlob]));
      
      setScaleOutput({ 
        age: ageData.age,
        fishType: ageData.fishType,
        enhanced: ageData.enhanced,
        placeholder: ageData.placeholder, // TODO: remove this when backend is ready
        imageUrl: pngUrl 
      });
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing the image.');
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
      containerSx={scaleAgeingStyles.container} // This styles the main "container" Box
    >
      {/* Only render the card if we actually have an age result */}
      {scaleOutput.age !== null && (
        <Box sx={scaleAgeingStyles.resultCard}>
          {/* A sub-container that arranges text lines vertically */}
          <Box sx={scaleAgeingStyles.resultContainer}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Estimated Fish Age: {scaleOutput.age}
            </Typography>
            
            <Typography sx={scaleAgeingStyles.infoLine}>
              Fish Type: {scaleOutput.fishType}
            </Typography>
            <Typography sx={scaleAgeingStyles.infoLine}>
              Enhanced?: {scaleOutput.enhanced ? "Yes" : "No"}
            </Typography>
            <Typography sx={scaleAgeingStyles.infoLine}>
              Placeholder?: {scaleOutput.placeholder}
            </Typography>
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