/**
 * Dashboard Layout Component
 * 
 * Main layout component for the DFO AI Portal. Manages the overall page structure 
 * including the header, left panel (for tool selection), and dynamic content area
 * that loads different tools based on user selection.
 */

import React, { useState, Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, CircularProgress, Alert } from '@mui/material';
import { GovHeader, LeftPanel } from '.';
import { getToolByName } from '../utils';
import { HomePage } from '../pages';
import { useLanguage } from '../contexts';
import { Footer, TermsModalContainer } from '../components/common';
import { getLayoutTranslations } from '../translations/layout'


import {
  ScaleAgeing,
  FenceCounting,
  CSVAnalyzer,
  PDFChatbot,
  PIIRedactor,
  SensitivityScore,
  FrenchTranslation,
  DocumentOCR
} from '../pages/tools';
import { SurveyForm } from '../pages/SurveyForm';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';

export default function Dashboard({ onLogout, isDemoMode }) {
  // Store the selected tool name
  const [selectedTool, setSelectedTool] = useState('');
  const [headerHeight, setHeaderHeight] = useState(80); // Default to 80px, dynamically updated
  const { language } = useLanguage();
  const dashboardTranslations = getLayoutTranslations('dashboard', language);
  const [showDisabledAlert, setShowDisabledAlert] = useState(false);

  // Use the styling hook with the dashboard style collection
  const styles = useComponentStyles('dashboard', { headerHeight });

  // Determine if we're on the home page (no tool selected)
  const isHomePage = !selectedTool;

  // Check if the tool should be disabled
  const isToolDisabled = (toolName) => {
    const tool = getToolByName(toolName);
    return tool && tool.disabled;
  };

  // Handle direct URL navigation attempts
  useEffect(() => {
    // Check if selected tool is disabled
    if (isToolDisabled(selectedTool)) {
      setShowDisabledAlert(true); 
    } else {
      setShowDisabledAlert(false);
    }
  }, [selectedTool]);

  /**
   * Handle tool selection
   * 
   * @param {string} toolName - Name of the selected tool
   */
  const handleToolSelect = (toolName) => {
    // If selecting "AI Tools Home" from dropdown, set to empty string
    // Ensures we always have the correct state for home page
    setSelectedTool(toolName || '');
    
    if (toolName) {
      const tool = getToolByName(toolName);
      if (tool) {
        console.log(`Selected tool: ${tool.name} (${tool.category})`);
        
        // Check if tool is disabled
        if (isToolDisabled(tool.name)) {
          console.log(`${tool.name} is currently disabled`);
          setShowDisabledAlert(true);
        }
      }
    } else {
      console.log('Navigating to home page');
    }
  };

  // Tool components mapped by tool name
  const toolComponents = {
    'Scale Ageing': ScaleAgeing,
    'Fence Counting': FenceCounting,
    'CSV/PDF Analyzer': CSVAnalyzer,
    'PDF Chatbot': PDFChatbot,
    'PII Redactor': PIIRedactor,
    'Sensitivity Score Calculator': SensitivityScore,
    'French Translation': FrenchTranslation,
    'Document OCR': DocumentOCR,
    'Form': SurveyForm,
  };

  const getToolComponent = (toolName) => {
    const ToolComponent = toolComponents[toolName];
    return ToolComponent ? <ToolComponent isDemoMode={isDemoMode} /> : null;
  };

  /**
   * Render the selected tool or HomePage if none selected
   * 
   * @returns {JSX.Element} The component for the selected tool or home page
   */
  const renderContent = () => {
    if (isHomePage) {
      return <HomePage />;
    }

    return (
      <>
        {showDisabledAlert && (
          <Box sx={{ maxWidth: 800, mt: 4, px: 2 }}>
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }}
              onClose={() => setShowDisabledAlert(false)}
            >
              {dashboardTranslations.disabledToolAlert}
            </Alert>
          </Box>
        )}
        {/* Show the tool component, with reduced opacity if disabled */}
        <Box sx={{ 
          opacity: isToolDisabled(selectedTool) ? 0.5 : 1,
          pointerEvents: isToolDisabled(selectedTool) ? 'none' : 'auto'
        }}>
          {getToolComponent(selectedTool) || <HomePage />}
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default' 
    }}>
      {/* Header with subtle extra padding */}
      <Box sx={{
        ...styles.container,
        pb: 0.25,
      }}>
        <GovHeader setHeaderHeight={setHeaderHeight} />
      </Box>

      {/* Main content area */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        position: 'relative',
        ...styles.mainWrapper,
        // Improved overflow handling to prevent content hiding
        overflowX: 'hidden',
        overflowY: 'auto',
        pt: 0.25 // 4px padding top
      }}>
        {/* Content wrapper with improved responsive layout and spacing */}
        <Box sx={{
          ...styles.contentWrapper,
          display: 'flex',
          // Responsive layout: column on mobile, row on desktop
          flexDirection: { xs: 'column', md: 'row' },
          flexGrow: 1,
          gap: 2,
          pt: 0.25 
        }}>
          {/* Left Panel with subtle spacing */}
          <Box sx={{ 
            width: { xs: '100%', md: 'auto' },
            position: { xs: 'static', md: 'relative' },
            height: { xs: 'auto', md: 'fit-content' },
            zIndex: 2, // Ensure it appears above other content
            // Add subtle spacing
            mt: 0.25, // 4px margin top
            mb: { xs: 0.25, md: 0 }
          }}>
            <LeftPanel 
              selectedTool={selectedTool} 
              onSelectTool={handleToolSelect}  
              headerHeight={headerHeight}
              isHomePage={isHomePage}
              onLogout={onLogout}
              isDemoMode={isDemoMode}
            />
          </Box>

          {/* Main content area with improved overflow handling */}
          <Box sx={{
            ...styles.mainContent,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            minWidth: 0, // Allow content to shrink
            mt: 0.25 // 4px margin top
          }}>
            {/* Tool content with proper overflow handling */}
            <Paper sx={{
              ...styles.contentPaper,
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              minWidth: 0, // Allow content to shrink
              // overflowX: 'auto', // Enable horizontal scrolling when needed
              // overflowY: 'visible', // Let content flow naturally
              overflow: 'visible'
            }}>
              <Suspense
                fallback={
                  <Box sx={styles.loadingContainer}>
                    <CircularProgress />
                  </Box>
                }
              >
                {renderContent()}
              </Suspense>
            </Paper>
          </Box>
        </Box>
        
        {/* Footer with subtle spacing above */}
        <Box sx={{ 
          width: '100vw', 
          position: 'relative', 
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw', 
          mt: 0.25
        }}>
          <Footer headerHeight={headerHeight} />
        </Box>
      </Box>
      
      {/* Terms modal for authenticated users */}
      <TermsModalContainer variant="full" isAuth={true} />
    </Box>
  );
}

Dashboard.propTypes = {
  /** Callback function for logout action */
  onLogout: PropTypes.func,

  /** Whether in demo mode */
  isDemoMode: PropTypes.bool.isRequired,
};