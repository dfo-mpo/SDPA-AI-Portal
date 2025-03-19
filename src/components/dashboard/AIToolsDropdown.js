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
} from '@mui/material';
import { Home } from 'lucide-react';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { TOOL_CATEGORIES } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';


/**
 * AI Tools dropdown for tool selection
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onToolSelect - Callback when a tool is selected
 * @param {String} [props.selectedTool] - Currently selected tool (if any)
 * @returns {JSX.Element} The rendered component
 */
export default function AIToolsDropdown({ onToolSelect, selectedTool }) {
  const { language } = useLanguage();
  const translations = getToolTranslations("aiToolsDropdown", language);
  const aiToolsDropdownStyles = useComponentStyles('aiToolsDropdown');

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
              <ListItemText
                primary={translations.home}
                secondary={translations.selectTool}
              />
            );
          }
          return selected;
        }}
        sx={aiToolsDropdownStyles.select}
      >
        {/* Reset / Back to Portal Home option */}
        <MenuItem value="" sx={aiToolsDropdownStyles.menuItem}>
          <ListItemIcon sx={aiToolsDropdownStyles.listItemIcon}>
            <Home size={18} />
          </ListItemIcon>
          <ListItemText
            primary={translations.home}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        {/* Categories & their items */}
        {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => [
          <ListSubheader key={category} sx={aiToolsDropdownStyles.subheader}>
            {translations.categories[category] || category}
          </ListSubheader>,
          ...tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <MenuItem
                key={tool.name}
                value={tool.name}
                sx={aiToolsDropdownStyles.menuItem}
              >
                <ListItemIcon sx={aiToolsDropdownStyles.listItemIcon}>
                  <IconComponent size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={translations.tools[tool.name] || tool.name}
                />
              </MenuItem>
            );
          })
        ])}
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