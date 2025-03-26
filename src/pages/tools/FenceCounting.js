/**
 * Fence Counting Tool Component
 * 
 * Main component for the Fence Counting tool, which uses computer vision to count
 * fish in monitoring videos. This component displays the user interface for the tool,
 * including its description and video upload functionality.
 */

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function FenceCounting() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("fenceCounting", language);
  const toolStyles = useComponentStyles('tool');
  
  const [originalVideo, setOriginalVideo] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle file upload and processing
   * 
   * @param {File} inputFile
   */
  const handleFileSelected = async (inputFile) => {
    setIsProcessing(true);
    
    // Create URL for displaying the original video
    const originalVideoUrl = URL.createObjectURL(inputFile);
    setOriginalVideo(originalVideoUrl);
    
    const formData = new FormData();  
    formData.append('file', inputFile);  
  
    try {
      const response = await axios.post('http://localhost:8080/fence_counting/', formData, {    
        responseType: 'blob',  
      }); 
      
      if (response.status === 200) {
        const videoUrl = URL.createObjectURL(new Blob([response.data]));
        setProcessedVideo(videoUrl);
      } else {  
        console.error('Failed to retrieve processed video');  
        alert('Failed to retrieve processed video');  
      }
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the video.');  
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/fence-counting.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isProcessing}
      containerSx={toolStyles.container} // if needed
    >
      {originalVideo && (
        <Box sx={toolStyles.videoContainer}>
          <Box sx={toolStyles.videoSection}>
            <Typography variant="h6" gutterBottom>
              Original Video
            </Typography>
            <video src={originalVideo} controls style={toolStyles.video} />
          </Box>
          
          {processedVideo && (
            <Box sx={toolStyles.videoSection}>
              <Typography variant="h6" gutterBottom>
                Processed Video with Fish Count
              </Typography>
              <video src={processedVideo} controls style={toolStyles.video} />
            </Box>
          )}
        </Box>
      )}
    </ToolPage>
  );
}
