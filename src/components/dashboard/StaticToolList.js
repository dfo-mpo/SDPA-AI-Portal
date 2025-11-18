/**
 * Static Tool List Component
 * 
 * Displays a categorized list of all available tools with icons on the portal home page.
 * Used in the LeftPanel when on the portal home page to allow tool selection.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography, 
  List,  
  ListItem, 
  ListSubheader, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Paper, 
  useTheme,
  Tooltip,
} from '@mui/material';
import { Home, AlertCircle, ExternalLink } from 'lucide-react';
import { TOOL_CATEGORIES } from '../../utils';
import { useLanguage, useAuth } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { trackEvent } from '../../utils/analytics';

/**
 * Static tool list for the portal home page
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onToolSelect - Callback when a tool is selected
 * @param {String} [props.selectedTool] - Currently selected tool (if any)
 * @returns {JSX.Element} The rendered component
 */
export default function StaticToolList({ onToolSelect, selectedTool }) {
  const { language } = useLanguage();
  const theme = useTheme();
  const translations = getToolTranslations("aiToolsDropdown", language);
  const staticToolListStyles = useComponentStyles('staticToolList');
  const dropdownStyles = useComponentStyles('dropdown');
  const isAuth = useAuth();

  // Translations for "Temporarily unavailable" tooltip
  const unavailableTooltip = {
    en: "Coming Soon! Temporarily unavailable while we make improvements",
    fr: "Bientôt disponible ! Temporairement indisponible pendant que nous l'améliorons"
  };
  // Translations for "Coming Soon" tooltip
  const comingSoonTooltip = {
    en: "Coming soon! This feature is currently in development.",
    fr: "Bientôt disponible ! Cette fonctionnalité est en cours de développement."
  };

  // Translations for "External Link" tooltip
  const externalLinkTooltip = {
    en: "Opens in a new tab",
    fr: "Ouvre dans un nouvel onglet"
  };


  return (
    <Paper
      // variant="outlined"
      sx={staticToolListStyles.paper}
    >
      {/* AI Tools Home Header with 'Select a tool' subtitle*/}
      <Box sx={staticToolListStyles.header}>
        <Box sx={staticToolListStyles.headerContent}>
          <Box sx={staticToolListStyles.titleContainer}>
            <Box
              component='img'
              src={theme.palette.mode === 'dark' 
                ? '/assets/AI_Portal_Icon_dark.png' 
                : '/assets/AI_Portal_Icon.png'}
              alt='Logo'
              sx={{
                width: 'auto',
                height: 20,
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            />
            <Typography 
              variant="h6" 
              sx={staticToolListStyles.title}
            >
              {/* {translations.home} */}
              {translations.title}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={staticToolListStyles.listContentWrapper}>
        {/* Categories and Tools */}
        {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => {
          const visibleTools = tools.filter(tool => {
            const isHideInDemo = tool.showInDemo === false && !isAuth;
            return !isHideInDemo;
          });

          if (visibleTools.length === 0) return null;
          
          return (
          <Box key={category} sx={staticToolListStyles.listWrapper}>
            {/* Check if the category should be displayed in demo mode */}
            <ListSubheader disableSticky sx={staticToolListStyles.subheader}>
              {translations.categories[category] || category}
            </ListSubheader>
            
            <List disablePadding sx={{ p: 0, m: 0, }}>
              {visibleTools.map((tool) => {
                const IconComponent = tool.icon;
                const isDisabled = tool.disabled;
                const isExternalLink = !!tool.externalUrl;
                // Determine appropriate tooltip
                let tooltipText = "";
                if (isDisabled) {
                  tooltipText = tool.category === 'Optical Character Recognition' 
                    ? (comingSoonTooltip[language] || comingSoonTooltip.en)
                    : (unavailableTooltip[language] || unavailableTooltip.en);
                } else if (isExternalLink) {
                  tooltipText = externalLinkTooltip[language] || externalLinkTooltip.en;
                }
                return (
                  <ListItem key={tool.name} disablePadding>
                    <Tooltip 
                      title={tooltipText}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() => {
                          // Only proceed if the tool is not disabled - defined in constants.js
                          if (!isDisabled) {
                            if (tool.externalUrl) {
                              // Open external URL in a new tab
                              window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              // Normal tool selection
                              trackEvent('Tool Access', `Selected ${tool.name}`, tool.name);
                              onToolSelect(tool.name);
                            }
                          }
                          // Do nothing if disabled
                        }}
                        sx={{
                          ...staticToolListStyles.listItemButton,
                          ...(isDisabled && {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                            pointerEvents: 'auto',
                            color: 'text.disabled',
                            // '&:hover': {
                            //   bgcolor: 'action.disabledBackground',
                            // }
                          }),
                          // Special styling if it's an external link
                          ...(isExternalLink && {
                            cursor: 'pointer',
                            // '&:hover': {
                            //   bgcolor: 'action.hover',
                            //   borderLeft: '3px solid',
                            //   borderLeftColor: 'success.main', // Different color for external links
                            // }
                          }),
                          // '&:hover': {
                          //   borderLeft: '3px solid',
                          //   borderLeftColor: 'primary.main',
                          // }
                        }}
                      >
                        <ListItemIcon sx={dropdownStyles.listItemIcon}>
                          {isDisabled ? 
                            <AlertCircle size={20} color={theme.palette.warning.main} /> : 
                            <IconComponent size={20} />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span>{translations.tools[tool.name] || tool.name}</span>
                              {isExternalLink && (
                                <ExternalLink 
                                  size={14} 
                                  style={{ 
                                    marginLeft: '6px',
                                    color: theme.palette.primary.main
                                  }} 
                                />
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{
                            ...(isDisabled && { 
                              color: 'text.disabled',
                              fontStyle: 'italic'
                            }),
                            ...(isExternalLink && {
                              color: 'text.disabled',
                              fontStyle: 'italic'
                            })
                          }}
                        />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )})}
      </Box>
    </Paper>
  );
}
StaticToolList.propTypes = {
  /** Callback function when a tool is selected */
  onToolSelect: PropTypes.func.isRequired,
  
  /** Currently selected tool (if any) */
  selectedTool: PropTypes.string
};