/**
 * File Upload Modal Component
 * 
 * A modal dialog for uploading CSV and PDF files for the CSV/PDF Analyzer tool.
 * Shows a visual demonstration of the workflow using GIFs and provides file upload
 * inputs for both CSV prompts and PDF documents.
 */

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { X, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';

/**
 * File upload modal for CSV Analyzer tool
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubmit - Function to handle file submission
 * @returns {JSX.Element} The rendered component
 */
function FileUploadModal({ open, onClose, onSubmit }) {
  const { language } = useLanguage();
  const translations = getToolTranslations("csvAnalyzer", language) || {};
  
  // Get modal and component styles from the styling system
  const modalStyles = useComponentStyles('termsModal');
  const styles = useComponentStyles('fileUploadModal');
  
  // File input refs
  const csvInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  
  // State for selected files
  const [csvFile, setCsvFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current step in the demo
  const [currentStep, setCurrentStep] = useState(0);
  
  // Reset state when modal closes
  const handleClose = () => {
    setCsvFile(null);
    setPdfFile(null);
    setIsSubmitting(false);
    setCurrentStep(0);
    onClose();
  };
  
  // Handle CSV file selection
  const handleCsvSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };
  
  // Handle PDF file selection
  const handlePdfSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (csvFile && pdfFile) {
      setIsSubmitting(true);
      
      // Simulate API call with a timeout
      setTimeout(() => {
        onSubmit({ csvFile, pdfFile });
        handleClose();
      }, 1500);
    }
  };
  
  // Step through the demo GIFs
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  // Demo GIFs for each step
  const demoGifs = [
    '/assets/giphy.gif',
    '/assets/giphy2.gif',
    '/assets/giphy3.gif'
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          ...modalStyles.dialogPaper,
          ...styles.dialogPaper,
        }
      }}
    >
      <DialogTitle sx={modalStyles.dialogTitle}>
        <Typography variant="h5" component="div">
          {translations.title || "CSV/PDF Analyzer"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Demo section */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            How It Works
          </Typography>
          
          {/* Stepper */}
          <Stepper activeStep={currentStep} sx={styles.stepperContainer}>
            <Step key="csv">
              <StepLabel>Create CSV Prompts</StepLabel>
            </Step>
            <Step key="pdf">
              <StepLabel>Prepare PDF Document</StepLabel>
            </Step>
            <Step key="analyze">
              <StepLabel>Analyze Results</StepLabel>
            </Step>
          </Stepper>
          
          {/* Demo GIF */}
          <Box sx={styles.gifContainer}>
            <img 
              src={demoGifs[currentStep]} 
              alt={`Demo step ${currentStep + 1}`} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Box>
          
          {/* Step navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              disabled={currentStep === 0} 
              onClick={handlePrevStep}
              variant="text"
            >
              Previous
            </Button>
            <Button 
              disabled={currentStep === 2} 
              onClick={handleNextStep}
              variant="text"
            >
              Next
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* File upload section */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upload Your Files
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload a CSV file with your analysis prompts and a PDF document to analyze.
          </Alert>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* CSV File Upload */}
            <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                CSV Prompts
              </Typography>
              
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCsvSelect}
              />
              
              <Box 
                sx={styles.fileInputBox}
                onClick={() => csvInputRef.current.click()}
              >
                {!csvFile ? (
                  <>
                    <FileSpreadsheet size={32} style={{ color: '#4caf50', marginBottom: '8px' }} />
                    <Typography variant="body2" align="center">
                      Click to upload your CSV file with prompts
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center">
                      .csv format required
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={styles.fileInfoContainer}>
                      <Box>
                        <Typography variant="body2" sx={styles.fileName}>
                          {csvFile.name}
                        </Typography>
                        <Typography variant="caption" sx={styles.fileSize}>
                          {(csvFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCsvFile(null);
                        }}
                      >
                        <X size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
            
            {/* PDF File Upload */}
            <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                PDF Document
              </Typography>
              
              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handlePdfSelect}
              />
              
              <Box 
                sx={styles.fileInputBox}
                onClick={() => pdfInputRef.current.click()}
              >
                {!pdfFile ? (
                  <>
                    <FileText size={32} style={{ color: '#f44336', marginBottom: '8px' }} />
                    <Typography variant="body2" align="center">
                      Click to upload your PDF document
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center">
                      .pdf format required
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={styles.fileInfoContainer}>
                      <Box>
                        <Typography variant="body2" sx={styles.fileName}>
                          {pdfFile.name}
                        </Typography>
                        <Typography variant="caption" sx={styles.fileSize}>
                          {(pdfFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                        }}
                      >
                        <X size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={modalStyles.dialogActions}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!csvFile || !pdfFile || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <Upload size={16} />}
        >
          {isSubmitting ? 'Processing...' : 'Analyze Files'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FileUploadModal.propTypes = {
  /** Whether the modal is open */
  open: PropTypes.bool.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired,
  /** Function to handle file submission */
  onSubmit: PropTypes.func.isRequired,
};

export default FileUploadModal;