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
import { Home, AlertCircle } from 'lucide-react';
import { TOOL_CATEGORIES } from '../../utils';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

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

  // Translations for "Temporarily unavailable" tooltip
  const unavailableTooltip = {
    en: "Temporarily unavailable while we make improvements",
    fr: "Temporairement indisponible pendant que nous l'améliorons"
  };

  return (
    <Paper
      variant="outlined"
      sx={staticToolListStyles.paper}
    >
      {/* AI Tools Home Header with 'Select a tool' subtitle*/}
      <Box sx={staticToolListStyles.header}>
        <Box sx={staticToolListStyles.headerContent}>
          <Box sx={staticToolListStyles.titleContainer}>
            <Box sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : '#26374A' }}>
              <Home size={20} />
            </Box>                
            <Typography 
              variant="h6" 
              sx={staticToolListStyles.title}
            >
              {translations.home}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={staticToolListStyles.subtitle}
          >
            {translations.selectTool}
          </Typography>
        </Box>
      </Box>
      
      {/* Categories and Tools */}
      {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
        <Box key={category}>
          <ListSubheader sx={staticToolListStyles.subheader}>
            {translations.categories[category] || category}
          </ListSubheader>
          
          <List disablePadding>
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              const isDisabled = tool.name === 'Sensitivity Score Calculator' || tool.name === 'PII Redactor';;
              return (
                <ListItem key={tool.name} disablePadding>
                  <Tooltip 
                    title={isDisabled ? (unavailableTooltip[language] || unavailableTooltip.en) : ""}
                    placement="right"
                  >
                  <ListItemButton
                    onClick={() => !isDisabled && onToolSelect(tool.name)}
                    sx={{
                      ...staticToolListStyles.listItem,
                      ...(isDisabled && {
                        opacity: 0.5,
                        cursor: 'not-allowed',
                        pointerEvents: 'auto',
                        color: 'text.disabled',
                        // borderLeft: '3px solid',
                        // borderLeftColor: 'warning.main',
                        '&:hover': {
                          bgcolor: 'action.disabledBackground',
                          // borderLeftColor: 'warning.main',
                        }
                      }),
                      '&:hover': {
                        borderLeft: '3px solid',
                        borderLeftColor: 'primary.palette.warning.main',
                      }
                    }}
                  >
                    <ListItemIcon sx={dropdownStyles.listItemIcon}>
                      {isDisabled ? 
                        <AlertCircle size={20} color={theme.palette.warning.main} /> : 
                        <IconComponent size={20} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={translations.tools[tool.name] || tool.name}
                      primaryTypographyProps={{
                        ...(isDisabled && { 
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
      ))}
    </Paper>
  );
}

StaticToolList.propTypes = {
  /** Callback function when a tool is selected */
  onToolSelect: PropTypes.func.isRequired,
  
  /** Currently selected tool (if any) */
  selectedTool: PropTypes.string
};