/**
 * CSV Analyzer Tool Component
 * 
 * Main component for the CSV/PDF Analyzer tool, which allows users to analyze 
 * structured data from CSV and PDF files. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React, { useState } from 'react';
import { Box, Typography, Card, Button, Alert, Stack, CircularProgress } from '@mui/material';
import { Upload, HelpCircle, Download } from 'lucide-react';
import { ToolPage } from '../../../components/tools';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';
import FileUploadModal from './FileUploadModal';
import { analyzeCsvPdf } from '../../../services/apiService';
import { trackEvent } from '../../../utils/analytics';

export function CSVAnalyzer() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("csvAnalyzer", language);
  
  // Use centralized style hooks
  const toolStyles = useComponentStyles('tool');
  const styles = useComponentStyles('csvAnalyzer');
  
  // Get settings from context
  const { csvAnalyzerSettings } = useToolSettings();
  
  // Component state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [resultBlobs, setResultBlobs] = useState({});

  /**
   * Handle the "Upload Files" button click
   */
  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  /**
   * Handle file upload submission from the modal
   * 
   * @param {Object} files - The selected files object containing csvFile and pdfFile
   */
  const handleFilesSubmit = async (files) => {
    // Close the modal first
    setIsModalOpen(false);
    
    // Then start processing
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call API service to analyze the files
      const result = await analyzeCsvPdf(files.csvFile, files.pdfFile, csvAnalyzerSettings); 
      
      // Get the available formats
      const availableFormats = Object.keys(result.formats);
      
      // Store all result blobs for download options
      setResultBlobs(result.formats);
      
      // Set the primary format for display
      const primaryFormat = result.primaryFormat || availableFormats[0] || 'json';
      
      // Set analysis result
      setAnalysisResult({
        status: 'success',
        message: 'Analysis completed successfully',
        fileName: files.pdfFile.name,
        csvName: files.csvFile.name,
        timestamp: new Date().toLocaleString(),
        primaryFormat: primaryFormat,
        data: result.formats[primaryFormat]?.data,
        availableFormats: availableFormats
      });
    } catch (err) {
      console.error('Error analyzing files:', err);
      setError('Failed to analyze files. Please check that your CSV and PDF are in the correct format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Download the result file
   * 
   * @param {string} format - The format to download (json, csv, text)
   */
  const handleDownload = (format) => {
    if (!resultBlobs[format]?.blob) return;
    
    const fileExtension = format === 'json' ? 'json' : 
                          format === 'csv' ? 'csv' : 'txt';
    const url = URL.createObjectURL(resultBlobs[format].blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-result.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Content to display analysis results
  const renderResults = () => {
    if (!analysisResult) return null;
    
    return (
      <Card variant="outlined" sx={styles.resultCard}>
        <Typography variant="h6" sx={styles.resultTitle}>
          Analysis Results
        </Typography>
        
        <Alert severity="success" sx={styles.alertSuccess}>
          {analysisResult.message}
        </Alert>
        
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight={500}>PDF Document:</Typography>
            <Typography variant="body2">{analysisResult.fileName}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight={500}>CSV Prompts:</Typography>
            <Typography variant="body2">{analysisResult.csvName}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight={500}>Processed on:</Typography>
            <Typography variant="body2">{analysisResult.timestamp}</Typography>
          </Box>
        </Stack>
        
        {/* Display JSON data if available */}
        {analysisResult.primaryFormat === 'json' && analysisResult.data && (
          <Box sx={styles.resultContent}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Analysis Data (JSON):</Typography>
            <Box sx={styles.jsonContainer}>
              {analysisResult.data.map((item, index) => (
                <Box key={index} sx={styles.jsonItem}>
                  <Typography variant="body2" fontWeight={500}>{item.header}:</Typography>
                  <Typography variant="body2">{item.response}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: {item.source}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Display Text data if available */}
        {analysisResult.primaryFormat === 'text' && analysisResult.data && (
          <Box sx={styles.resultContent}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Analysis Data (Text):</Typography>
            <Box sx={styles.textContainer}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {analysisResult.data}
              </pre>
            </Box>
          </Box>
        )}
        
        {/* For CSV format, we just provide download button */}
        {analysisResult.primaryFormat === 'csv' && (
          <Box sx={styles.resultContent}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              CSV file ready for download. Use the button below to save it.
            </Typography>
          </Box>
        )}
        
        {/* Download buttons for each available format */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => {
              trackEvent('CSV Analyzer File Interaction', 'Process New Files', 'Process New Files Button');
              setAnalysisResult(null);
              setResultBlobs({});
              setIsModalOpen(true);
            }}
            startIcon={<Upload size={16} />}
          >
            Process New Files
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {analysisResult.availableFormats && analysisResult.availableFormats.map(format => (
              <Button 
                key={format}
                variant={format === analysisResult.primaryFormat ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  trackEvent('CSV Analyzer File Interaction', 'Download File', `Download ${format} Format`);
                  handleDownload(format);
                }}
                startIcon={<Download size={16} />}
                disabled={!resultBlobs[format]?.blob}
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </Box>
        </Box>
      </Card>
    );
  };

  // Custom styles specifically for the CSV Analyzer gifs
  const customStyles = {
    // Override container to ensure proper flow on small screens
    container: {
      mt: 2, 
      mb: 4, 
      width: '100%',
      minWidth: 0, // Allow shrinking
      overflow: 'visible' // Don't clip content
    },
    // Modified demo steps container with better responsive layout
    demoStepsContainer: {
      display: 'flex',
      // Stack vertically on extra small screens, horizontally on larger screens
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      alignItems: 'center',
      justifyContent: { xs: 'center', sm: 'space-between' },
      p: 2,
      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
      borderRadius: 1,
      minWidth: 0, // Allow container to shrink
      overflow: 'visible'
    },
    // Modified step container for better responsiveness
    stepContainer: {
      flex: 1,
      textAlign: 'center',
      width: '100%',
      minWidth: 0, // Allow container to shrink
    },
    // Modified gif container for consistent sizing
    gifContainer: {
      height: { xs: 80, sm: 120 }, // Smaller on mobile
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 1,
      width: '100%',
      overflow: 'hidden' // Hide overflow rather than clipping the whole component
    },
    // Gif styling to prevent disappearing
    gif: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      minHeight: { xs: 60, sm: 80 } // Ensure minimum visibility
    }
  };

  return (
    <>
      <ToolPage
        title={toolData.title}
        shortDescription={toolData.shortDescription}
        longDescription={toolData.longDescription}
        backgroundImage="/assets/analyze.png"
        actionButtonText={toolData.actionButtonText}
        onFileSelected={handleUploadClick}
        isProcessing={isProcessing}
        hideActionButton={true} // Hide the default action button
      >
        {/* Loading indicator */}
        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Analyzing files, please wait...
            </Typography>
          </Box>
        )}
        
        {/* Error alert */}
        {error && !isProcessing && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Visual Demonstration with improved responsiveness */}
        {!analysisResult && !isProcessing && (
          <Box sx={customStyles.container}>
            <Card variant="outlined" sx={styles.demoCard}>
              <Typography variant="h6" sx={styles.headerContainer}>
                <HelpCircle size={20} style={{ marginRight: '8px' }} />
                How It Works
              </Typography>
              
              {/* Improved demo steps container with better responsive layout */}
              <Box sx={customStyles.demoStepsContainer}>
                {/* Step 1 */}
                <Box sx={customStyles.stepContainer}>
                  <Box sx={customStyles.gifContainer}>
                    <img 
                      src="/assets/giphy.gif" 
                      alt="Create CSV prompts" 
                      style={customStyles.gif}
                    />
                  </Box>
                  <Typography variant="subtitle2">1. Create CSV Prompts</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Define your analysis questions in a CSV
                  </Typography>
                </Box>
                
                {/* Step 2 */}
                <Box sx={customStyles.stepContainer}>
                  <Box sx={customStyles.gifContainer}>
                    <img 
                      src="/assets/giphy2.gif" 
                      alt="Prepare PDF document" 
                      style={customStyles.gif}
                    />
                  </Box>
                  <Typography variant="subtitle2">2. Prepare PDF Document</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Have your PDF document ready for analysis
                  </Typography>
                </Box>
                
                {/* Step 3 */}
                <Box sx={customStyles.stepContainer}>
                  <Box sx={customStyles.gifContainer}>
                    <img 
                      src="/assets/giphy3.gif" 
                      alt="Review results" 
                      style={customStyles.gif}
                    />
                  </Box>
                  <Typography variant="subtitle2">3. Analyze Results</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Get insights from your document based on your prompts
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={styles.actionContainer}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    trackEvent('CSV Analyzer File Interaction', 'Trigger Upload', 'Upload Button Click');
                    handleUploadClick();
                  }}                  
                  startIcon={isProcessing ? <CircularProgress size={16} /> : <Upload size={16} />}
                  disabled={isProcessing}
                  sx={toolStyles.actionButton}
                >
                  {isProcessing ? "Processing..." : toolData.actionButtonText || "Upload Files"}
                </Button>
              </Box>
            </Card>
          </Box>
        )}
        
        {/* Analysis Results */}
        {analysisResult && !isProcessing && renderResults()}
      </ToolPage>
      
      {/* File Upload Modal */}
      <FileUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFilesSubmit}
      />
    </>
  );
}

export default CSVAnalyzer;