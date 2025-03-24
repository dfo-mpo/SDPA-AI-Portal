/**
 * CSV Analyzer Tool Component
 * 
 * Main component for the CSV/PDF Analyzer tool, which allows users to analyze 
 * structured data from CSV and PDF files. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React, { useState } from 'react';
import { Box, Typography, Card, Button, Alert, Stack } from '@mui/material';
import { Upload, HelpCircle } from 'lucide-react';
import { ToolPage } from '../../../components/tools';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';
import FileUploadModal from './FileUploadModal';

export function CSVAnalyzer() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("csvAnalyzer", language);
  
  // Use centralized style hooks
  const toolStyles = useComponentStyles('tool');
  const styles = useComponentStyles('csvAnalyzer');
  
  // Component state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const handleFilesSubmit = (files) => {
    setIsProcessing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setAnalysisResult({
        status: 'success',
        message: 'Analysis completed successfully',
        fileName: files.pdfFile.name,
        csvName: files.csvFile.name,
        timestamp: new Date().toLocaleString()
      });
      setIsProcessing(false);
    }, 2000);
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
        
        <Box sx={styles.resultFooter}>
          <Typography variant="body2" color="text.secondary">
            Full analysis results would be displayed here, including insights extracted
            from the document based on your CSV prompts.
          </Typography>
        </Box>
        
        {/* Add button to process new files */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => {
              setAnalysisResult(null);
              setIsModalOpen(true);
            }}
            startIcon={<Upload size={16} />}
          >
            Process New Files
          </Button>
        </Box>
      </Card>
    );
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
        {/* Visual Demonstration */}
        {!analysisResult && (
          <Box sx={styles.container}>
            <Card variant="outlined" sx={styles.demoCard}>
              <Typography variant="h6" sx={styles.headerContainer}>
                <HelpCircle size={20} style={{ marginRight: '8px' }} />
                How It Works
              </Typography>
              
              <Box sx={styles.demoStepsContainer}>
                {/* Step 1 */}
                <Box sx={styles.stepContainer}>
                  <Box sx={styles.gifContainer}>
                    <img 
                      src="/assets/giphy.gif" 
                      alt="Create CSV prompts" 
                      style={{ height: '55px', width: 'auto', objectFit: 'contain' }}
                    />
                  </Box>
                  <Typography variant="subtitle2">1. Create CSV Prompts</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Define your analysis questions in a CSV
                  </Typography>
                </Box>
                
                {/* Step 2 */}
                <Box sx={styles.stepContainer}>
                  <Box sx={styles.gifContainer}>
                    <img 
                      src="/assets/giphy2.gif" 
                      alt="Prepare PDF document" 
                      style={{ height: '55px', width: 'auto', objectFit: 'contain' }}
                    />
                  </Box>
                  <Typography variant="subtitle2">2. Prepare PDF Document</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Have your PDF document ready for analysis
                  </Typography>
                </Box>
                
                {/* Step 3 */}
                <Box sx={styles.stepContainer}>
                  <Box sx={styles.gifContainer}>
                    <img 
                      src="/assets/giphy3.gif" 
                      alt="Review results" 
                      style={{ height: '55px', width: 'auto', objectFit: 'contain' }}
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
                  onClick={handleUploadClick}
                  startIcon={<Upload size={16} />}
                  sx={toolStyles.actionButton}
                >
                  {toolData.actionButtonText || "Upload Files"}
                </Button>
              </Box>
            </Card>
          </Box>
        )}
        
        {/* Analysis Results */}
        {renderResults()}
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