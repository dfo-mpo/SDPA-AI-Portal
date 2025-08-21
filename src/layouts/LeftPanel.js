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
  alpha
} from '@mui/material';
import { Settings, Home } from 'lucide-react'; 
import { AIToolsDropdown, StaticToolList } from '../components/dashboard';
import { OptionsMenu } from '../components/common';
import { getLayoutTranslations } from '../translations/layout';
import { useLanguage } from '../contexts';
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
import { useMsal } from '@azure/msal-react';

/**
 * Left panel component for navigation and settings
 *
 * @param {Object} props - Component props
 * @param {string} [props.selectedTool] - Currently selected tool
 * @param {Function} props.onSelectTool - Callback when a tool is selected
 * @param {number} props.headerHeight - Height of the application header
 * @param {boolean} props.isHomePage - Whether currently on home page
 * @param {Function} [props.onLogout] - Callback for logout action
 * @returns {JSX.Element} The rendered component
 */
export default function NewLeftPanel({ 
  selectedTool, 
  onSelectTool, 
  isHomePage, 
  onLogout,
  onLogin
}) {
  const theme = useTheme();
  const { language } = useLanguage();
  const panelTranslations = getLayoutTranslations('leftPanel', language);

  const { accounts } = useMsal();
  const user = accounts[0] ?? null;

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
      width: { xs: '100%', md: 350 },
      minWidth: { xs: '100%', md: 325 },
      maxWidth: { xs: '100%', md: 400 },
      borderRadius: '8px',
      p: 2,
      overflow: 'visible', 
      display: 'flex',
      flexDirection: 'column',
      height: { xs: 'auto', md: 'fit-content' }, 
      justifyContent: 'space-between',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      // On small screens, marginBottom gives space between panel and content
      mb: { xs: 2, md: 0 }
    },
    content: {
      flexGrow: 1,
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'visible',
    },
    toolSelectionContainer: {
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      gap: 1,
      width: '100%',
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
      mt: 1,
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      overflow: 'auto'
    },
    settingsCardContent: {
      p: 1.5,
      "&:last-child": { pb: 1.5 },
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    settingsHeader: {
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      pb: 2,
      borderBottom: '1px solid',
      borderColor: 'divider'
    },
    settingsIcon: {
      marginRight: '6px'
    },
    settingsTitle: {
      fontWeight: 600
    },
    settingsContent: {
      flexGrow: 1,
      overflow: 'visible',
      pr: 0.5
    },
    profileSection: {
      borderColor: 'divider',
      p: 2,
      mt: 'auto',
    },
    avatar: {
      width: 36,
      height: 36
    },
    userInfo: {
      mr: 'auto'
    },
    userName: {
      fontWeight: 500
    },
    userEmail: {
      color: 'text.secondary'
    },
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
      variant="outlined"
      sx={styles.container}
    >
      {/* Top Section - Dropdown or Static Tool List */}
      <Box sx={styles.content}>
        {isHomePage || !showToolSettings() ? (
          <StaticToolList onToolSelect={onSelectTool} selectedTool={selectedTool} />
        ) : (
          <Box sx={styles.toolSelectionContainer}>
            {/* Home Button */}
            <IconButton 
              onClick={() => {
                trackEvent('Left Panel Navigation', 'Go to Home', 'Home Button');
                handleHomeClick();
              }}
              sx={styles.homeButton}
              aria-label="Return to home"
            >
              <Home size={22} />
            </IconButton>

            {/* Dropdown grows to fill remaining space */}
            <Box sx={styles.dropdownWrapper}>
              <AIToolsDropdown 
                onToolSelect={onSelectTool} 
                selectedTool={selectedTool} 
              />
            </Box>
          </Box>
        )}

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

      {/* Bottom Profile Section */}
      <Box sx={styles.profileSection}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            alt={user ? user.name : 'Guest'}
            src="/static/images/avatar/7.jpg"
            sx={styles.avatar}
          />
          <Box sx={styles.userInfo}>
            <Typography variant="body2" sx={styles.userName}>
              {user ? user.name : 'Guest'}
            </Typography>
            <Typography variant="caption" sx={styles.userEmail}>
              {user ? user.username : 'guest@example.com'}
            </Typography>
          </Box> 
          <OptionsMenu onLogout={onLogout} onLogin={onLogin} />
        </Stack>
      </Box>
    </Paper>
  );
}

NewLeftPanel.propTypes = {
  /** Currently selected tool (if any) */
  selectedTool: PropTypes.string,
  
  /** Callback function when a tool is selected */
  onSelectTool: PropTypes.func.isRequired,
  
  /** Height of the application header in pixels */
  headerHeight: PropTypes.number.isRequired,
  
  /** Whether currently on home page */
  isHomePage: PropTypes.bool.isRequired,
  
  /** Callback function for logout action */
  onLogout: PropTypes.func,

  /** Callback function for login action */
  onLogin: PropTypes.func,
};