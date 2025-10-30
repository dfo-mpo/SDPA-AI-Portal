/**
 * Left Panel Component (New Version)
 *
 * Displays the application's left navigation panel, containing tool selection
 * and settings. Shows either a dropdown or a static tool list depending on context,
 * and displays tool-specific settings when a tool is selected.
 * 
 * This is a refactored version that uses the new styling system.
 */


import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Stack,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { Settings, Home } from 'lucide-react'; 
import { AIToolsDropdown, StaticToolList } from '../components/dashboard';
import { UserProfile } from '../components/common';
import { getLayoutTranslations } from '../translations/layout';
import { useLanguage, useAuth } from '../contexts';
import { trackEvent } from '../utils/analytics';

// Import our custom hooks and styles
import { useComponentStyles } from '../styles/hooks/useComponentStyles';

// Import all tool settings components
import {
  ScaleAgeingSettings,
  PIIRedactorSettings,
  FenceCountingSettings,
  SensitivityScoreSettings,
  PDFChatbotSettings,
  FrenchTranslationSettings,
  CSVAnalyzerSettings
} from '../components/tools/settings';

import { getToolByName } from '../utils';
import zIndex from '@mui/material/styles/zIndex';
import { BorderTop } from '@mui/icons-material';

/**
 * Left panel component for navigation and settings
 *
 * @param {Object} props - Component props
 * @param {string} [props.selectedTool] - Currently selected tool
 * @param {Function} props.onSelectTool - Callback when a tool is selected
 * @param {boolean} props.isHomePage - Whether currently on home page
 * @param {Function} [props.onLogout] - Callback for logout action
 * @returns {JSX.Element} The rendered component
 */
export default function NewLeftPanel({ 
  selectedTool, 
  onSelectTool, 
  isHomePage, 
  onLogout,
  onLogin,
  isMdUp,
  showLeftPanel
}) {
  const theme = useTheme();
  // const styles = useComponentStyles('leftPanel');
  const { language } = useLanguage();
  const panelTranslations = getLayoutTranslations('leftPanel', language);
  const isAuth = useAuth();

  // Map tool names to their corresponding settings components
  const toolSettings = {
    'Scale Ageing': <ScaleAgeingSettings />,
    'PII Redactor': <PIIRedactorSettings />,
    'Fence Counting': <FenceCountingSettings />,
    'Sensitivity Score Calculator': <SensitivityScoreSettings />,
    'PDF Chatbot': <PDFChatbotSettings />,
    'French Translation': <FrenchTranslationSettings />,
    'CSV/PDF Analyzer': <CSVAnalyzerSettings />
  };

  // Component-specific styles
  const styles = {
    // Improved container sizing for better responsive behavior
    container: {
      // width: { xs: '100%', md: 350 },
      // minWidth: { xs: '100%', md: 325 },
      // maxWidth: { xs: '100%', md: 400 },
      // borderRadius: '8px',
      // p: 2,
      // overflow: 'visible', 
      display: 'flex',
      flexDirection: 'column',
      height: { xs: 'auto', md: '100vh' },
      // justifyContent: 'space-between',
      bgcolor: 'background.paper',
      // border: '1px solid',
      // borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
      // boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      // // On small screens, marginBottom gives space between panel and content
      // mb: { xs: 2, md: 0 }
      transform: showLeftPanel ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'all 0.3s ease',
    },
    content: {
      flexGrow: 1,
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
    },
    toolSelectionContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      p: 3,
      overflowX: 'hidden',
    },
    homeButton: (theme) => ({
      width: '45px',
      height: '45px',
      padding: 0,
      borderRadius: '50%', 
      color: theme.palette.mode === 'dark' 
        ? theme.palette.primary.light 
        : theme.palette.primary.main,
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.primary.dark, 0.6) 
        : alpha(theme.palette.primary.light, 0.5),
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.25)
        : alpha(theme.palette.primary.light, 0.15),
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.dark, 0.4)
          : alpha(theme.palette.primary.light, 0.25),
        borderColor: theme.palette.mode === 'dark'
          ? theme.palette.primary.dark
          : theme.palette.primary.light,
      },
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.2s ease-in-out',
    }),
    dropdownWrapper: {
      flexGrow: 1,
    },
    settingsCard: {
      p: 0,
      // mt: 1,
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      // borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      // boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      // overflow: 'auto',
      border: 'none',
      
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: 'all 0.3s ease',
      scrollbarColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0) transparent'
          : 'rgba(0,0,0,0) transparent',
      "&:hover": {
        scrollbarColor: 
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.25) transparent'
            : 'rgba(0,0,0,0.15) transparent',
      },
      // compensate right padding so scrollbar hugs paper edge
      mr: -3,
      pr: 3,
    },
    settingsCardContent: {
      // p: 1.5,
      // "&:last-child": { pb: 1.5 },
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    settingsHeader: {
      display: 'flex',
      alignItems: 'center',
      // mb: 2,
      pb: 2,
      // borderBottom: '1px solid',
      // borderColor: 'divider'
    },
    settingsIcon: {
      marginRight: '6px'
    },
    settingsTitle: {
      fontWeight: 600
    },
    settingsContent: {
      // flexGrow: 1,
      // overflow: 'visible',
      // pr: 0.5
    },
    userProfileWrapper: {
      width: '100%',
      flexShrink: 0,
      zIndex: 2,
      py: 2,
      px: 3,
      backgroundColor: theme.palette.background.default,      

      ...(!isMdUp && 
        {
          position: 'relative',
          left: 'auto',
          bottom: 'auto',
          zIndex: 'auto',
          p: 2,
          mb: 2,
          borderBottom: '1px solid',
        }
      ),

      borderTop: '1px solid',
      borderColor: theme.palette.divider,
    }
  };

  const showToolSettings = () => {
    const tool = getToolByName(selectedTool);
    return tool && tool.showInDropdown !== false;
  };

  /**
   * Handle click on Home button
   */
  const handleHomeClick = () => {
    onSelectTool('');
  };

  return (
    <Paper
      // variant="outlined"
      sx={styles.container}
    >
      {/* Top Section - Dropdown or Static Tool List */}
      <Box sx={styles.content}>
        {isHomePage || !showToolSettings() ? (
          <StaticToolList onToolSelect={onSelectTool} selectedTool={selectedTool} />
        ) : (
          <Box sx={styles.toolSelectionContainer}>
            {/* Dropdown grows to fill remaining space */}
            <Box sx={styles.dropdownWrapper}>
              <AIToolsDropdown 
                onToolSelect={onSelectTool} 
                selectedTool={selectedTool} 
              />
            </Box>

            {/* Tool-specific settings section */}
            {selectedTool && !isHomePage && showToolSettings() && toolSettings[selectedTool] && (
              <Card variant="outlined" sx={styles.settingsCard}>
                <CardContent sx={styles.settingsCardContent}>
                  <Box sx={styles.settingsHeader}>
                    <Settings size={16} style={styles.settingsIcon} />
                    <Typography variant="subtitle2" sx={styles.settingsTitle}>
                      {panelTranslations.settings}
                    </Typography>
                  </Box>
                  <Box sx={styles.settingsContent}>
                    {toolSettings[selectedTool]}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>

      <Box sx={styles.userProfileWrapper}>
        <UserProfile onLogout={onLogout} onLogin={onLogin} />
      </Box>
    </Paper>
  );
}

NewLeftPanel.propTypes = {
  /** Currently selected tool (if any) */
  selectedTool: PropTypes.string,
  
  /** Callback function when a tool is selected */
  onSelectTool: PropTypes.func.isRequired,
  
  /** Whether currently on home page */
  isHomePage: PropTypes.bool.isRequired,
  
  /** Callback function for logout action */
  onLogout: PropTypes.func,

  /** Callback function for login action */
  onLogin: PropTypes.func,
  
  /** Whether current screen size above Md */
  isMdUp: PropTypes.bool,

  /** Whether LeftPanel is open */
  showLeftPanel: PropTypes.bool,
};