/**
 * Web Scraper Settings Component
 *
 * This just lets you pick which AI model the Web Scraper will use.
 */

import React from 'react';
import { Select, MenuItem, Typography } from '@mui/material';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import {
  SettingsContainer,
  SettingFormControl,
  SettingHelperText,
} from '../../../layouts';

export default function toolSettings({ onSettingsChange = () => {} }) { // TODO: rename function name to one matching tool
  const { language } = useLanguage();
  const translations =
    getToolTranslations('toolname', language)?.settings || {}; // TODO: rename input name for tool translations with tool name (must match what you use later when adding translations)

  // Get settings from context
  const { toolNameSettings, updateToolNameSettings } = useToolSettings(); // TODO: place 'toolName' with your tool's name

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    const next = {
      ...toolNameSettings, // TODO: place 'toolName' with your tool's name
      [field]: value,
    };

    // Update in context
    updateToolNameSettings(next); // TODO: place 'toolName' with your tool's name

    // Bubble up to parent if needed
    onSettingsChange(next);
  };

  return (
    <SettingsContainer>
      {/* Model Selection
      TODO: Add logic here for the settings you wish allow the user to choose from on the left side menu.  
      -- see working example below that add a lable "AI Model", and a selction box.
      The selection box has the options 'GPT-4.1-mini', 'GPT-4o', and 'GPT-4o mini (default)'. It also has helper text defined by SettingHelperText*/}
      <SettingFormControl
        label={translations.modelType || 'AI Model'}
      >
        <Select
          value={webScraperSettings.modelType}
          onChange={handleChange('modelType')}
        >
          <MenuItem value="gpt41mini">
            {translations.gpt41mini || 'GPT-4.1-mini'}
          </MenuItem>
          <MenuItem value="gpt4o">
            {translations.gpt4o || 'GPT-4o'}
          </MenuItem>
          <MenuItem value="gpt4omini">
            {translations.gpt4omini || 'GPT-4o mini (default)'}
          </MenuItem>
        </Select>
      </SettingFormControl>

      <SettingHelperText>
        {translations.modelNote ||
          'Choose which model the Web Scraper should use when summarizing and parsing pages.'}
      </SettingHelperText>
    </SettingsContainer>
  );
}
