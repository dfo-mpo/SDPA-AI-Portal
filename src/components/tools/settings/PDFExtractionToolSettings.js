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

export default function PDFExtractionToolSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations =
    getToolTranslations('pdfExtractionTool', language)?.settings || {};

  // Get settings from context
  const { PDFExtractionToolSettings, updatePDFExtractionToolSettings } = useToolSettings();

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    const next = {
      ...PDFExtractionToolSettings,
      [field]: value,
    };

    // Update in context
    updatePDFExtractionToolSettings(next);

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
          value={PDFExtractionToolSettings.modelType}
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
          'Choose which model the PDF Extraction Tool should use when answering.'}
      </SettingHelperText>
    </SettingsContainer>
  );
}
