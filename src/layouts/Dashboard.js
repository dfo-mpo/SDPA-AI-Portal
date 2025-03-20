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

export default function DashboardLayout({ onLogout }) {
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
    <Box>
      {/* Wrapper to align GovHeader with LeftPanel */}
      <Box sx={styles.container}>
        {/* Pass setHeaderHeight so GovHeader can update it */}
        <GovHeader setHeaderHeight={setHeaderHeight} />
      </Box>

      <Box sx={styles.mainWrapper}>
        {/* Content wrapper */}
        <Box sx={styles.contentWrapper}>
          <LeftPanel 
            selectedTool={selectedTool} 
            onSelectTool={handleToolSelect} 
            headerHeight={headerHeight}
            isHomePage={isHomePage}
            onLogout={onLogout}
          />

          {/* Main content area */}
          <Box sx={styles.mainContent}>
            {/* Tool content */}
            <Paper sx={styles.contentPaper}>
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
      </Box>
    </Box>
  );
}

DashboardLayout.propTypes = {
  /** Callback function for logout action */
  onLogout: PropTypes.func
};
