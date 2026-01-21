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

export default function WebScraperSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations =
    getToolTranslations('webScraper', language)?.settings || {};

  // Get settings from context
  const { webScraperSettings, updateWebScraperSettings } = useToolSettings();

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    const next = {
      ...webScraperSettings,
      [field]: value,
    };

    // Update in context
    updateWebScraperSettings(next);

    // Bubble up to parent if needed
    onSettingsChange(next);
  };

  return (
    <SettingsContainer>
      {/* Model Selection */}
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
