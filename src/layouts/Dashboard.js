/**
 * Dashboard Layout Component
 * 
 * Main layout component for the DFO AI Portal. Manages the overall page structure 
 * including the header, left panel (for tool selection), and dynamic content area
 * that loads different tools based on user selection.
 */

import React, { useState, Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme, useMediaQuery, Box, Paper, CircularProgress, Alert, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { GovHeader, LeftPanel } from '.';
import { getToolByName, getParam, getAllParams, updateURLParams } from '../utils';
import { HomePage, DocxEditor, SurveyForm } from '../pages';
import { useLanguage, useAuth } from '../contexts';
import { Footer, TermsModalContainer } from '../components/common';
import { getLayoutTranslations } from '../translations/layout'
import {
  ScaleAgeing,
  FenceCounting,
  ElectronicMonitoring,
  UnderwaterMarineLifeAnnotation,
  FishPopulationEstimation,
  DetectionofGhostGear,
  CTDDataQualityControl,
  CSVAnalyzer,
  PDFChatbot,
  PIIRedactor,
  SensitivityScore,
  FrenchTranslation,
  DocumentOCR
} from '../pages/tools';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';

export default function Dashboard({ onLogout, onLogin }) {
  // Store the selected tool name
  const [selectedTool, setSelectedTool] = useState('');
  const [headerHeight, setHeaderHeight] = useState(80); // Default to 80px, dynamically updated
  const { language } = useLanguage();
  const dashboardTranslations = getLayoutTranslations('dashboard', language);
  const [showDisabledAlert, setShowDisabledAlert] = useState(false);
  
  const leftPanelWidth = '380';
  const collapsedLeftPanelWidth = '66';

  const theme = useTheme();

  // Use the styling hook with the dashboard style collection
  const styles = useComponentStyles('dashboard', { headerHeight });

  // Use auth context for log in validation
  const isAuth = useAuth();

  // Matches "Md" size (above 'md' breakpoint)
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Determine if we're on the home page (no tool selected)
  const isHomePage = !selectedTool;

  // Retrieve all current URL search parameters once on load
  const searchParams = getAllParams();
  
  useEffect(()=>{
    // If param detected on load, switch to tool page
    if (getParam('view')) {
      const view = getParam('view');
      // Try to match param to a known tool
      const tool = getToolByName(view);
      if (view && tool) {
        // If the tool is valid, update the selected tool in state
        setSelectedTool(view);
      } else {
        // If param is invalid or unrecognized, clean the URL
        updateURLParams({});
      }
    }
  }, [searchParams]);

  // Check if the tool should be disabled
  const isToolDisabled = (toolName) => {
    const tool = getToolByName(toolName);
    return tool && tool.disabled;
  };

  // Set state for showing LeftPanel
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const toggleLeftPanel = () => setShowLeftPanel((prev) => !prev);

  // Force to show the LeftPanel if screen size below md
  useEffect(() => {
    if (!isMdUp) {
      setShowLeftPanel(true);
    }
  }, [isMdUp]);

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
    // Reset url params
    updateURLParams({});
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
    'Electronic Monitoring': ElectronicMonitoring,
    'Underwater Marine Life Annotation': UnderwaterMarineLifeAnnotation,
    'Fish Population Estimation': FishPopulationEstimation,
    'Detection of Ghost Gear': DetectionofGhostGear,
    'CTD Data Quality Control': CTDDataQualityControl,
    'CSV/PDF Analyzer': CSVAnalyzer,
    'PDF Chatbot': PDFChatbot,
    'PII Redactor': PIIRedactor,
    'Sensitivity Score Calculator': SensitivityScore,
    'French Translation': FrenchTranslation,
    'Document OCR': DocumentOCR,
    'Form': SurveyForm,
    'Document': DocxEditor,
  };

  const getToolComponent = (toolName) => {
    const ToolComponent = toolComponents[toolName];
    if (!ToolComponent) return null;
    const props = { isAuth }
    if (toolName === 'Document') {
      if (getParam('file')) props.file = getParam('file');
      if (!isAuth && getParam('enableOfficeEditing') === 'true') props.enableOfficeEditing = true; // Editing is prohibited for none signed in users
    }
    return ToolComponent ? <ToolComponent {...props} /> : null;
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
          <Box sx={{ maxWidth: 800 }}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: theme.palette.warning.main,
                  alignSelf: 'center'
                },
               }}
              // onClose={() => setShowDisabledAlert(false)}
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

  const renderToggleButton = () => {
    if (isMdUp) {
      return (
        <IconButton
          onClick={toggleLeftPanel}
          size="string"
          sx={{
            position: 'absolute',
            top: 20,
            right: 12,
            zIndex: 100,
            transition: 'all 1s ease',
            border: 'none',
          }}
        >
          {showLeftPanel ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      );
    }
    return null;
  };

  const renderHeader = (
    <Box sx={styles.headerContainer}>
      <GovHeader setHeaderHeight={setHeaderHeight} />
    </Box>
  );

  return (
    <Box sx={styles.dashboardWrapper}>
      {/* Screen width smaller than md */}
      {!isMdUp && renderHeader}
        
      {/* Left Panel */}
      <Box 
        sx={{
          ...styles.LeftPanelWrapper,
          width: { xs: '100%', md: `${leftPanelWidth}px` },
          minWidth: `${leftPanelWidth}px`,
          transform: showLeftPanel ? 'translateX(0)' : `translateX(calc(-100% + ${collapsedLeftPanelWidth}px))`,
          transition: 'all 0.3s ease',
        }}
      >
        {/* {isHomePage && renderToggleButton()} */}
        {renderToggleButton()}
        <LeftPanel 
          selectedTool={selectedTool} 
          onSelectTool={handleToolSelect}  
          isHomePage={isHomePage}
          onLogout={onLogout}
          onLogin={onLogin}
          isMdUp={isMdUp}
          showLeftPanel={showLeftPanel}
        />
      </Box>

      {/* Main content area */}
      <Box 
        sx={{
          ...styles.mainWrapper,
          ml: showLeftPanel ? 0 : `calc(-${leftPanelWidth}px + ${collapsedLeftPanelWidth}px)`,
        }}
      >
        {isMdUp && renderHeader}
        
        {/* Content wrapper with improved responsive layout and spacing */}
        <Box sx={styles.contentWrapper}>
          {/* Main content area with improved overflow handling */}
          <Box sx={styles.mainContent}>
            {/* Tool content with proper overflow handling */}
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

        {/* Footer with subtle spacing above */}
        <Box sx={styles.footerContainer}>
          <Footer />
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