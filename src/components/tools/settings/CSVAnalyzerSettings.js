/**
 * CSV Analyzer Settings Component
 * 
 * Settings panel for the CSV/PDF Analyzer tool. Allows users to configure the AI model,
 * analysis type, source display preferences, and output format options.
 */

import React, { useState } from 'react';
import { 
  Select, 
  MenuItem,
  Box,
  Typography,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../common';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl,
  SettingDivider,
  SettingAlignedRow
} from '../../../layouts';

/**
 * Settings component for CSV Analyzer tool
 * 
 * @returns {JSX.Element} The rendered component
 */
export default function CSVAnalyzerSettings() {
  const { language } = useLanguage();
  const translations = getToolTranslations("csvAnalyzer", language)?.settings || {};

  // Settings state
  const [settings, setSettings] = useState({
    aiModel: 'gpt4omini',
    analysisType: 'summary',
    showSources: true,
    outputFormats: {
      text: true,
      csv: false,
      json: false
    }
  });

  // Get component styles
//   const dropdownStyles = useComponentStyles('dropdown');
  const commonStyles = useComponentStyles('toolSettingsCommon');


  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [field]: value });
  };

  /**
   * Handle output format change
   * 
   * @param {string} format - The format option to toggle
   * @returns {Function} Event handler function
   */
  const handleOutputFormatChange = (format) => (event) => {
    const newOutputFormats = { 
      ...settings.outputFormats,
      [format]: event.target.checked 
    };
    setSettings({ ...settings, outputFormats: newOutputFormats });
  };

  return (
    <SettingsContainer>
      {/* AI Model Selection */}
      <SettingFormControl label={translations.aiModel}>
        <Select
          value={settings.aiModel}
          onChange={handleChange('aiModel')}
        //   sx={dropdownStyles.select}
        >
          <MenuItem value="gpt4omini">{translations.gpt4omini}</MenuItem>
          <MenuItem value="gpt4o">{translations.gpt4o}</MenuItem>
          <MenuItem value="gpt35">{translations.gpt35}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Analysis Type */}
      <SettingFormControl label={translations.analysisType}>
        <Select
          value={settings.analysisType}
          onChange={handleChange('analysisType')}
        //   sx={dropdownStyles.select}
        >
          <MenuItem value="summary">{translations.summary}</MenuItem>
          <MenuItem value="detailed">{translations.detailed}</MenuItem>
          <MenuItem value="comparison">{translations.comparison}</MenuItem>
          <MenuItem value="custom">{translations.custom}</MenuItem>
        </Select>
      </SettingFormControl>
      
      <SettingDivider />
      
      {/* Output Options */}
      <Box>
        {/* Output Options Header with tooltip */}
        <SettingAlignedRow
          left={
            <Typography variant="body2" sx={commonStyles.sectionHeader}>
              {translations.outputOptions || "Output Options"}
            </Typography>
          }
          right={
            <Tooltip title={translations.outputOptionsTooltip || "Configure how you want the analysis results displayed"}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0.75 }}
        />
        
        {/* Show Sources Option */}
        <SettingRow
          label={translations.showSources || "Show Document Sources"}
          control={
            <CustomSwitch 
              checked={settings.showSources} 
              onChange={handleChange('showSources')}
              size="small"
            />
          }
          sx={commonStyles.formRow}
        />
        
        {/* Output Format Options */}
        <SettingAlignedRow
          left={
            <Typography variant="body2" sx={commonStyles.sectionHeader}>
              {translations.outputFormats || "Output Formats"}
            </Typography>
          }
          right={
            <Tooltip title={translations.outputFormatsTooltip || "Select one or more formats for the output"}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mt: 2, mb: 0.75 }}
        />
        
        <SettingRow
          label={translations.textOutput || "Text Output"}
          control={
            <CustomSwitch 
              checked={settings.outputFormats.text} 
              onChange={handleOutputFormatChange('text')}
              size="small"
            />
          }
          sx={{ ...commonStyles.formRow, mb: 1 }}
        />
        
        <SettingRow
          label={translations.csvOutput || "CSV Output"}
          control={
            <CustomSwitch 
              checked={settings.outputFormats.csv} 
              onChange={handleOutputFormatChange('csv')}
              size="small"
            />
          }
          sx={{ ...commonStyles.formRow, mb: 1 }}
        />
        
        <SettingRow
          label={translations.jsonOutput || "JSON Output"}
          control={
            <CustomSwitch 
              checked={settings.outputFormats.json} 
              onChange={handleOutputFormatChange('json')}
              size="small"
            />
          }
          sx={commonStyles.formRow}
        />
      </Box>
      
      <SettingHelperText>
        {translations.fileSizeNote}
      </SettingHelperText>
    </SettingsContainer>
  );
}