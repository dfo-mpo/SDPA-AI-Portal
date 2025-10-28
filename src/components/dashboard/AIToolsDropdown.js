/**
 * AI Tools Dropdown Component
 * 
 * Displays a dropdown menu for selecting AI tools, categorized by type.
 * Used in the LeftPanel to navigate between different tools on tool pages.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  MenuItem,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  FormControl,
  Typography,
  Box
} from '@mui/material';
import { Home, AlertCircle } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { TOOL_CATEGORIES } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useIsAuthenticated } from '@azure/msal-react';

export default function AIToolsDropdown({ onToolSelect, selectedTool }) {
  const { language } = useLanguage();
  const theme = useTheme();
  const translations = getToolTranslations("aiToolsDropdown", language);
  const aiToolsDropdownStyles = useComponentStyles('aiToolsDropdown');
  const isAuth = useIsAuthenticated();

  /**
   * Handle change in dropdown selection
   * 
   * @param {Object} event - Change event
   */
  const handleChange = (event) => {
    const selected = event.target.value;
    onToolSelect?.(selected);
  };

  return (
    <FormControl fullWidth>
      <Select
        value={selectedTool || ''}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <>
                <ListItemText
                  primary={translations.home}
                  secondary={translations.selectTool}
                />
              </>
            );
          }
          // Look up the translation for the selected tool name and allow wrapping
          return (
            <Box style={{ 
              ...aiToolsDropdownStyles.selectionBox,
              whiteSpace: 'normal' 
            }}>
              <ListItemText>
                <Typography variant="body1">
                  {translations.tools[selected] || selected}
                </Typography>
              </ListItemText>
            </Box>
          );
        }}
        sx={{
          ...aiToolsDropdownStyles.select,
          width: { md: 'calc(100% - 40px)' },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              p: 2,
            },
          },
          MenuListProps: {
            sx: {
              p: 0,
            },
          },
        }}
      >
        {/* Reset / Back to Portal Home option */}
        <MenuItem value="" sx={aiToolsDropdownStyles.menuItemHome}>
          <ListItemIcon sx={aiToolsDropdownStyles.listItemIcon}>
            <Box
              component='img'
              src={theme.palette.mode === 'dark' 
                ? '/assets/AI_Portal_Icon_dark.png' 
                : '/assets/AI_Portal_Icon.png'}
              alt='Logo'
              sx={{
                width: 'auto',
                height: 18,
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            />
          </ListItemIcon>
          <ListItemText
            // primary={translations.home}
            // primaryTypographyProps={{ fontWeight: 500 }}
          >
            <Typography variant="h6" >
              {/* {translations.home} */}
              {translations.title}
            </Typography>
          </ListItemText>
        </MenuItem>
        {/* Categories & their items */}
        {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => {
          const visibleTools = tools.filter(tool => tool.showInDropdown !== false);

          if (visibleTools.length === 0) return null;

          return [
            <ListSubheader disableSticky key={category} sx={aiToolsDropdownStyles.subheader}>
              {translations.categories[category] || category}
            </ListSubheader>,
            ...tools.map((tool) => {
              const IconComponent = tool.icon;
              const isDisabled = tool.disabled;
              const isHideInDemo = tool.showInDemo === false && !isAuth;
              if (isHideInDemo) return null;
              return (
                <MenuItem
                  key={tool.name}
                  value={tool.name}
                  disabled={isDisabled}
                  sx={{
                    ...aiToolsDropdownStyles.menuItem,
                    ...(isDisabled && {
                      opacity: 0.7,
                      '& .MuiListItemText-root': {
                        opacity: 0.7,
                      }
                    })
                  }}
                >
                  <ListItemIcon
                    sx={{
                      ...aiToolsDropdownStyles.listItemIcon,
                      ...(isDisabled && { opacity: 1 }) // override opacity for icon
                    }}
                  >
                    {isDisabled ? 
                      <AlertCircle size={18} color={theme.palette.warning.main} /> : 
                      <IconComponent size={18} />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary={translations.tools[tool.name] || tool.name}
                    // primaryTypographyProps={{ 
                    //   noWrap: false,
                    //   sx: { 
                    //     wordBreak: 'break-word',
                    //     whiteSpace: 'normal',
                    //     ...(isDisabled && { fontStyle: 'italic' })
                    //   }
                    // }}
                  />
                </MenuItem>
              );
            })
          ]
        })}
      </Select>
    </FormControl>
  );
}

AIToolsDropdown.propTypes = {
  /** Callback function when a tool is selected */
  onToolSelect: PropTypes.func.isRequired,
  
  /** Currently selected tool (if any) */
  selectedTool: PropTypes.string
};
