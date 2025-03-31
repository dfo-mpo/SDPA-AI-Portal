/**
 * Fence Counting Tool Component
 * 
 * Main component for the Fence Counting tool, which uses computer vision to count
 * fish in monitoring videos. This component displays the user interface for the tool,
 * including its description, video upload functionality, and sample video options.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { Play, Upload } from 'lucide-react'; 
import { ToolPage } from '../../components/tools';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { processFenceCounting } from '../../services/apiService';
import { useLanguage, useToolSettings } from '../../contexts';

export function FenceCounting() {
  const { language } = useLanguage();
  const { fenceCountingSettings } = useToolSettings();
  const toolData = getToolTranslations("fenceCounting", language);
  const toolStyles = useComponentStyles('tool');
  
  const [originalVideo, setOriginalVideo] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSamples, setShowSamples] = useState(true);

  /**
   * Handle file upload and processing for real file uploads
   * 
   * @param {File} inputFile
   */
  const handleFileSelected = async (inputFile) => {
    if (!inputFile) return;
    
    setIsProcessing(true);
    setShowSamples(false);
    
    // Create URL for displaying the original video
    const originalVideoUrl = URL.createObjectURL(inputFile);
    setOriginalVideo(originalVideoUrl);
    
    try {
      const response = await processFenceCounting(inputFile, fenceCountingSettings);
      
      // Create URL from the blob response
      const videoUrl = URL.createObjectURL(response);
      setProcessedVideo(videoUrl);
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the video.');  
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle sample video selection and processing
   * 
   * @param {string} filename - The filename of the sample video
   * @param {string} label - The display label for the video
   */
  const handleUseSample = async (filename, label) => {
    try {
      setIsProcessing(true);
      setProcessedVideo(null);
      setSelectedVideo(label);
      setShowSamples(false);

      const response = await fetch(`/assets/videos/${filename}`);
      const blob = await response.blob();

      // Wrap Blob in a File object so the backend sees a "file upload"
      const demoFile = new File([blob], filename, { type: "video/mp4" });
      
      // Use the regular file handler now that we have a proper File object
      const originalVideoUrl = URL.createObjectURL(demoFile);
      setOriginalVideo(originalVideoUrl);
      
      const processedResponse = await processFenceCounting(demoFile, fenceCountingSettings);
      const videoUrl = URL.createObjectURL(processedResponse);
      setProcessedVideo(videoUrl);
    } catch (error) {
      console.error("Error processing sample:", error);
      alert("Failed to process the sample video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample video data
  const sampleVideos = [
    { 
      filename: "Chinook-9s.mp4", 
      label: "Chinook (9s)", 
      description: toolData.sample.chinook
    },
    { 
      filename: "Sockeye-2s.mp4", 
      label: "Sockeye (2s)",
      description: toolData.sample.sockeye
    },
  ];

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/fence-counting.png"
      hideActionButton={true}
      containerSx={toolStyles.container}
    >
      {/* Custom Upload Button - Visible but Disabled */}
      <Box sx={{ mb: 3 }}>
        <div style={{ 
          display: 'inline-block', 
          cursor: 'not-allowed',
          position: 'relative'
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Upload size={16} />}
            sx={{
              ...toolStyles.actionButton,
              pointerEvents: 'none', // Prevents hover effects
              opacity: 0.7, // Makes it look disabled
            }}
          >
            {toolData.ui.uploadVideo}
          </Button>
          {/* Tooltip-like element that appears on hover */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              p: 1,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: 1,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              zIndex: 10,
              '&:before': {
                content: '""',
                position: 'absolute',
                top: -5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '5px solid rgba(0,0,0,0.7)',
              },
              '.not-allowed-container:hover &': {
                opacity: 1,
              }
            }}
            className="tooltip-style"
          >
            {toolData.ui.uploadDisabled}
          </Box>
        </div>
      </Box>

      {/* Sample Videos Section - Show only if no video is being displayed/processed */}
      {showSamples && !originalVideo && !isProcessing && (
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            mt: 2,
            p: 3, 
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
          }}
        >
          <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
            {toolData.ui.sampleTitle}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {toolData.ui.sampleSubtitle}
          </Typography>
          
          <Grid container spacing={3}>
            {sampleVideos.map((video) => (
              <Grid item xs={12} sm={6} key={video.filename}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardMedia
                    component="video"
                    src={`/assets/videos/${video.filename}`}
                    controls
                    sx={{ height: { xs: 180, sm: 220 }, objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {video.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUseSample(video.filename, video.label)}
                      startIcon={<Play size={16} />}
                      fullWidth
                      sx={{
                        ...toolStyles.actionButton,
                        textTransform: 'none',
                        py: 1
                      }}
                    >
                      {toolData.ui.viewResults}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Box sx={{ 
          width: '100%', 
          textAlign: 'center', 
          py: 4,
          mt: 2,
          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            {toolData.ui.processing} {selectedVideo ? selectedVideo : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {toolData.ui.processingMessage}
          </Typography>
        </Box>
      )}

      {/* Results Display */}
      {originalVideo && !isProcessing && (
        <Box sx={{ mt: 2 }}>
          <Box sx={toolStyles.videoContainer}>
            <Box sx={toolStyles.videoSection}>
              <Typography variant="h6" gutterBottom>
                {toolData.ui.originalVideo}
              </Typography>
              <video src={originalVideo} controls style={toolStyles.video} />
              {selectedVideo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {toolData.ui.source}: {selectedVideo}
                </Typography>
              )}
            </Box>
            
            {processedVideo && (
              <Box sx={toolStyles.videoSection}>
                <Typography variant="h6" gutterBottom>
                  {toolData.ui.processedVideo}
                </Typography>
                <video src={processedVideo} controls style={toolStyles.video} />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>{toolData.ui.resultsHeading}:</strong> {toolData.ui.resultsDescription}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {toolData.ui.resultsNote}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Try Another Video Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setOriginalVideo(null);
                setProcessedVideo(null);
                setSelectedVideo(null);
                setShowSamples(true);
              }}
              sx={{ textTransform: 'none' }}
            >
              {toolData.ui.tryAgain}
            </Button>
          </Box>
        </Box>
      )}
    </ToolPage>
  );
}

export default FenceCounting;