/**
 * Dashboard Layout Component
 * 
 * Main layout component for the DFO AI Portal. Manages the overall page structure 
 * including the header, left panel (for tool selection), and dynamic content area
 * that loads different tools based on user selection.
 */

import React, { useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, CircularProgress } from '@mui/material';
import { GovHeader, LeftPanel } from '.';
import { getToolByName } from '../utils';
import { HomePage } from '../pages';
import { useTerms } from '../contexts';
import { Footer, TermsModalContainer } from '../components/common';

import {
  ScaleAgeing,
  FenceCounting,
  CSVAnalyzer,
  PDFChatbot,
  PIIRedactor,
  SensitivityScore,
  FrenchTranslation
} from '../pages/tools';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';

export default function Dashboard({ onLogout }) {
  // Store the selected tool name
  const [selectedTool, setSelectedTool] = useState('');
  const [headerHeight, setHeaderHeight] = useState(80); // Default to 80px, dynamically updated

  // Use the new styling hook with the dashboard style collection
  // Pass headerHeight so the mainWrapper style function can compute its height.
  const styles = useComponentStyles('dashboard', { headerHeight });

  // Determine if we're on the home page (no tool selected)
  const isHomePage = !selectedTool;

  // Tool components mapped by tool name
  const toolComponents = {
    'Scale Ageing': <ScaleAgeing />,
    'Fence Counting': <FenceCounting />,
    'CSV/PDF Analyzer': <CSVAnalyzer />,
    'PDF Chatbot': <PDFChatbot />,
    'PII Redactor': <PIIRedactor />,
    'Sensitivity Score Calculator': <SensitivityScore />,
    'French Translation': <FrenchTranslation />,
  };

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
      }
    } else {
      console.log('Navigating to home page');
    }
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
    return toolComponents[selectedTool] || <HomePage />;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default' 
    }}>
      {/* Header */}
      <Box sx={styles.container}>
        <GovHeader setHeaderHeight={setHeaderHeight} />
      </Box>

      {/* Main content area */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        position: 'relative',
        ...styles.mainWrapper
      }}>
        {/* Content wrapper - with no flex-direction column to ensure LeftPanel and MainContent are side-by-side */}
        <Box sx={{
          ...styles.contentWrapper,
          display: 'flex',
          flexGrow: 1,
          gap: 3,
        }}>
          {/* Left Panel */}
          <Box sx={{ 
            position: 'relative',
            height: 'fit-content', // Ensures the container fits its content
            zIndex: 2 // Ensure it appears above other content
          }}>
            <LeftPanel 
              selectedTool={selectedTool} 
              onSelectTool={handleToolSelect}  
              headerHeight={headerHeight}
              isHomePage={isHomePage}
              onLogout={onLogout}
            />
          </Box>

          {/* Main content area */}
          <Box sx={{
            ...styles.mainContent,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}>
            {/* Tool content */}
            <Paper sx={{
              ...styles.contentPaper,
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
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
        
        {/* Footer positioned below all content - with full-width container */}
        <Box sx={{ 
          width: '100vw', 
          position: 'relative', 
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw', 
          mt: 0 
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
  onLogout: PropTypes.func
};