/**
 * CSV Analyzer Settings Component
 * 
 * Settings panel for the CSV/PDF Analyzer tool. Allows users to configure the AI model,
 * analysis type, source display preferences, and output format options.
 */

import React from 'react';
import { 
  Select, 
  MenuItem,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
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
  const { csvAnalyzerSettings, setCsvAnalyzerSettings } = useToolSettings();
  const translations = getToolTranslations("csvAnalyzer", language)?.settings || {};

  // Get component styles
  const commonStyles = useComponentStyles('toolSettingsCommon');

  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setCsvAnalyzerSettings({ ...csvAnalyzerSettings, [field]: value });
  };

  /**
   * Handle output format change
   * 
   * @param {string} format - The format option to toggle
   * @returns {Function} Event handler function
   */
  const handleOutputFormatChange = (format) => (event) => {
    const isChecked = event.target.checked;
    
    // If turning off a format, make sure we have at least one format selected
    if (!isChecked) {
      // Count how many formats are currently enabled
      const enabledFormats = Object.values(csvAnalyzerSettings.outputFormats)
        .filter(value => value === true).length;
        
      if (enabledFormats <= 1) {
        // Don't allow turning off the last format - must have at least one
        return;
      }
    }
    
    // Create new outputFormats object with the toggled format
    const newOutputFormats = { 
      ...csvAnalyzerSettings.outputFormats,
      [format]: isChecked 
    };
    
    // Update the settings - allow multiple formats to be selected
    setCsvAnalyzerSettings({ 
      ...csvAnalyzerSettings, 
      outputFormats: newOutputFormats,
      // We'll set the first selected format as the primary
      outputType: isChecked ? format : (
        // Find the first enabled format if this one is being disabled
        Object.entries(newOutputFormats)
          .find(([_, enabled]) => enabled)?.[0] || 'json'
      )
    });
  };

  return (
    <SettingsContainer>
      {/* AI Model Selection */}
      <SettingFormControl label={translations.aiModel || "AI Model"} disabled>
        <Select
          value={csvAnalyzerSettings.aiModel}
          onChange={handleChange('aiModel')}
        >
          <MenuItem value="gpt4omini">{translations.gpt4omini || "GPT-4o Mini"}</MenuItem>
          <MenuItem value="gpt4o">{translations.gpt4o || "GPT-4o"}</MenuItem>
          <MenuItem value="gpt35">{translations.gpt35 || "GPT-3.5"}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Analysis Type */}
      <SettingFormControl label={translations.analysisType || "Analysis Type"} disabled>
        <Select
          value={csvAnalyzerSettings.analysisType}
          onChange={handleChange('analysisType')}
        >
          <MenuItem value="summary">{translations.summary || "Summary"}</MenuItem>
          <MenuItem value="detailed">{translations.detailed || "Detailed analysis"}</MenuItem>
          <MenuItem value="comparison">{translations.comparison || "Comparative analysis"}</MenuItem>
          <MenuItem value="custom">{translations.custom || "Custom prompt"}</MenuItem>
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
              checked={csvAnalyzerSettings.showSources} 
              onChange={handleChange('showSources')}
              size="small"
              disabled
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
              checked={csvAnalyzerSettings.outputFormats.text} 
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
              checked={csvAnalyzerSettings.outputFormats.csv} 
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
              checked={csvAnalyzerSettings.outputFormats.json} 
              onChange={handleOutputFormatChange('json')}
              size="small"
            />
          }
          sx={commonStyles.formRow}
        />
      </Box>
      
      <SettingHelperText>
        {translations.fileSizeNote || "Files larger than 10MB may take longer to process."}
      </SettingHelperText>
    </SettingsContainer>
  );
}