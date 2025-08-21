import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Stack, CircularProgress, Box } from '@mui/material';
import { Upload } from 'lucide-react';
import ToolContentWrapper from './ToolContentWrapper';
import Banner from '../common/Banner';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { trackEvent } from '../../utils/analytics';
import { useIsAuthenticated } from '@azure/msal-react';

/**
 * Tool page component that provides consistent layout for all tools
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Tool title
 * @param {string} props.shortDescription - Brief description for banner
 * @param {string} props.longDescription - Detailed description
 * @param {string} [props.backgroundImage='/assets/default-banner.jpg'] - URL for banner background image
 * @param {string} [props.actionButtonText='Upload File'] - Text for the action button
 * @param {Function} props.onFileSelected - Callback when a file is selected
 * @param {boolean} [props.isProcessing=false] - Whether the tool is currently processing
 * @param {boolean} [props.inProgress=false] - Whether the tool is currently in progress of development
 * @param {boolean} [props.isFormValid=true] - Whether the form is valid for submission (e.g., weights add up to 100%)
 * @param {string} [props.validationMessage=''] - Message to show when form is invalid
 * @param {boolean} [props.hideActionButton=false] - Whether to hide the default action button
 * @param {string} [props.uploadKey] - Key to force recreation of the file input
 * @param {React.ReactNode} [props.children] - Additional content to render
 * @returns {JSX.Element} The rendered component
 */
export default function ToolPage({
  title,
  shortDescription,
  longDescription,
  backgroundImage = '/assets/default-banner.jpg',
  actionButtonText = 'Upload File',
  onFileSelected,
  mutliUpload = false,
  isProcessing = false,
  isFormValid = true,
  validationMessage = '',
  downloadSamplesBtn = '',
  hideActionButton = false,
  inProgress = false,
  uploadKey = Date.now(), // Default key for reset support
  children,
}) {
  // Get styles from our styling system
  const toolStyles = useComponentStyles('tool');
  const layoutStyles = useComponentStyles('layout');
  const isAuth = useIsAuthenticated();
  
  // Local styles
  const styles = {
    actionContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap' // Allow items to wrap on smaller screens
    },
    validationWarning: {
      color: 'error.main',
      fontSize: '0.75rem',
      ml: 1,
      fontWeight: 500
    },
    // Add responsive container for content
    contentContainer: {
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto', // Allow horizontal scrolling if needed
      wordBreak: 'break-word' // Break long words to prevent overflow
    }
  };
  
  const fileInputRef = useRef();

  /**
   * Handle file input change. If multiUpload is true, will be saved as an array of Files. Otherwise a single file is saved into onFileSelected
   * @param {Event} event - The change event
   */
  const onFileChange = (event) => {
    if (mutliUpload) {
      const files = Array.from(event.target.files); // Convert FileList to an array 
      if (files.length > 0) {
        console.log("File selected in ToolPage onFileChange:", files.map(file => file.name));
        onFileSelected(files);
      }
    } else {
      const file = event.target.files[0];
      if (file) {
        console.log("File selected in ToolPage onFileChange:", file.name);
        onFileSelected(file);
      }
    }
  };

  return (
    <>
      <Banner
        title={title}
        description={shortDescription}
        backgroundImage={backgroundImage}
        variant="hero"
      />

      <ToolContentWrapper>
        <Box sx={styles.contentContainer}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography sx={{
              ...toolStyles.description,
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {longDescription}
            </Typography>

            {/* Hidden file input element - key ensures it's recreated when reset occurs */}
            <input
              type="file"
              ref={fileInputRef}
              key={uploadKey} // This ensures the input is recreated when uploadKey changes
              style={{ display: 'none' }}
              onChange={onFileChange}
              accept=".pdf,.docx,.doc,.xlsx,.csv,.txt"
              multiple={mutliUpload}
            />

            {/* Upload button with loading indicator - only shown if not hidden */}
            {!hideActionButton && (
              <div styles={{display: 'flex', justifyContent: 'space-around', flexDirection: 'row'}}>
                <Box sx={styles.actionContainer}>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      trackEvent('File Upload', 'Click', ToolPage.title);
                      fileInputRef.current?.click();
                    }}
                    disabled={isProcessing || !isFormValid}
                    startIcon={<Upload size={16} />}
                    sx={{
                      ...toolStyles.actionButton,
                      whiteSpace: 'nowrap' // Prevent button text from wrapping
                    }}
                  >
                    {actionButtonText}
                  </Button>

                  {isProcessing && (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  )}
                  
                  {!isFormValid && validationMessage && (
                    <Typography sx={styles.validationWarning}>
                      {validationMessage}
                    </Typography>
                  )}
                </Box>
                {/* {downloadSamplesBtn && downloadSamplesBtn.length > 0 ? (  
                  downloadSamplesBtn.map((sample, index) => {  
                    return (  
                      <Box key={index} sx={styles.actionContainer}>  
                        <Button  
                          variant="contained"  
                          onClick={() => {  
                            trackEvent('File Upload', 'Click', ToolPage.title);  
                            fileInputRef.current?.click();  
                          }}  
                          disabled={isProcessing || !isFormValid}  
                          startIcon={<Upload size={16} />}  
                          sx={{  
                            ...toolStyles.actionButton,  
                            whiteSpace: 'nowrap' // Prevent button text from wrapping  
                          }}  
                        >  
                          {actionButtonText}  
                        </Button>  
                      </Box>  
                    );  
                  })  
                ) : (  
                  <p>No samples available</p> // Render a message if no samples are available  
                )}   */}
              </div>
            )}

            
            
            {inProgress && (
              <Box sx={styles.actionContainer}>
                <Button 
                  variant="contained"
                  onClick={() => {}}
                  startIcon={<Upload size={16} />}
                  sx={{
                    ...toolStyles.actionButton,
                    whiteSpace: 'nowrap' // Prevent button text from wrapping
                  }}
                >
                  Upload
                </Button>
              </Box> 
            )}
            
            {/* Tool-specific content (results, additional UI) */}
            {children}
          </Stack>
        </Box>
      </ToolContentWrapper>
    </>
  );
}

ToolPage.propTypes = {
  /** Tool title displayed in the banner */
  title: PropTypes.string.isRequired,
  
  /** Brief description shown in the banner */
  shortDescription: PropTypes.string,
  
  /** Detailed description shown on the tool page */
  longDescription: PropTypes.string,
  
  /** Background image URL for the banner */
  backgroundImage: PropTypes.string,
  
  /** Text for the file upload button */
  actionButtonText: PropTypes.string,
  
  /** Callback function when a file is selected */
  onFileSelected: PropTypes.func.isRequired,

  mutliUpload: PropTypes.bool,
  
  /** Whether the tool is currently processing data */
  isProcessing: PropTypes.bool,
  
  /** Whether the form is valid and ready for submission */
  isFormValid: PropTypes.bool,
  
  /** Message to show when form is invalid */
  validationMessage: PropTypes.string,
  
  /** Whether to hide the default action button */
  hideActionButton: PropTypes.bool,
  
  /** Key to force recreation of the file input */
  uploadKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  /** Additional content to render below the description */
  children: PropTypes.node,
};