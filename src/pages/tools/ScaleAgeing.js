/**
 * Scale Ageing Tool Component
 * 
 * Main component for the Scale Ageing tool, which uses AI to estimate
 * fish age from scale images. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
        slice: ageData.slice?.length ? ageData.slice : null,
        species: ageData.species || species,
        enhanced: ageData.enhanced || enhance,
        placeholder: ageData.placeholder || false,
        imageUrl: pngUrl, 
        filename: ageData.filename || null
      });
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the image: ' + error.message);
    } finally {
      setIsProcessing(false); 
    }
  };

  // Function to create image using the list of image data
  function createImageFromPixelArray(pixelArray) {
    const height = pixelArray.length;
    const width = pixelArray[0].length;

    console.log('Image height:', height);
    console.log('Image width:', width);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const [r, g, b] = pixelArray[y][x];

        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png'); // returns base64 PNG image
  }

  // Creating image URL
  const sliceImageUrl = useMemo(() => {
    if (scaleOutput.slice) {
      return createImageFromPixelArray(scaleOutput.slice);
    }
    return null;
  }, [scaleOutput.slice]);

  // Add overlay slice image to select scale image
  const overlayImageStyleConfig = {
    'age5_Chum_SCL_2001_10.tif': {
      bottom: '85%', 
      left: '48%', 
      height: '48%', 
    },
    'age6_Chum_SCL_2001_218.tif': {
      bottom: '88%', 
      height: '45%', 
    }
  };

  const overlayImageStyle = overlayImageStyleConfig[scaleOutput.filename];


  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/scales.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      downloadSamplesBtn={isDemoMode? ['assets/scaleageing/chum_age5.tif', 'assets/scaleageing/chum_age6.tif']: ''}
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
              {/* Estimated Fish Age: */}
              {scaleOutput.age.split('/n').map((line) => (
                <>{line}<br /></>
              ))}
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
            <Box sx={scaleAgeingStyles.resultImageContainer}>
              <img 
                src={scaleOutput.imageUrl} 
                alt="Processed scale image" 
                style={scaleAgeingStyles.resultImage}
              />
              {sliceImageUrl && overlayImageStyle && (
                <img
                  src={sliceImageUrl}
                  alt="Slice image"
                  style={{
                    ...scaleAgeingStyles.resultSliceOverlay, 
                    ...overlayImageStyle
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </ToolPage>
  );
}