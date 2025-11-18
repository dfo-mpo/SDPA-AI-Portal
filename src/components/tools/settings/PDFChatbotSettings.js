/**
 * PDF Chatbot Settings Component
 * 
 * Settings panel for the PDF Chatbot tool. Allows users to configure the AI model,
 * context window size, temperature, and follow-up question suggestions for the PDF Chatbot.
 */

import React from 'react';
import { 
  Select, 
  MenuItem,
  Box,
  Slider,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import { HelpCircle, Thermometer } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl,
  SettingDivider,
  SettingAlignedRow
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';

export default function PDFChatbotSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations = getToolTranslations("pdfChatbot", language)?.settings || {};

  // Get settings from context
  const { pdfChatbotSettings, updatePdfChatbotSettings } = useToolSettings();
  
  // Get styles from our styling system
  const commonStyles = useComponentStyles('toolSettingsCommon');
  const styles = useComponentStyles('pdfChatbotSettings');

  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    // Update settings in context
    updatePdfChatbotSettings({
      ...pdfChatbotSettings,
      [field]: value
    });
    
    // Call parent's onChange handler if provided
    if (onSettingsChange) {
      onSettingsChange({
        ...pdfChatbotSettings,
        [field]: value
      });
    }
  };

  /**
   * Handle slider value change
   * 
   * @param {string} field - The field to update
   * @returns {Function} Event handler function
   */
  const handleSliderChange = (field) => (_, value) => {
    // Update settings in context
    updatePdfChatbotSettings({
      ...pdfChatbotSettings,
      [field]: value
    });
    
    // Call parent's onChange handler if provided
    if (onSettingsChange) {
      onSettingsChange({
        ...pdfChatbotSettings,
        [field]: value
      });
    }
  };

  return (
    <SettingsContainer>
      {/* Model Selection */}
      <SettingFormControl label={translations.modelType || "AI Model"} disabled>
        <Select
          value={pdfChatbotSettings.modelType}
          onChange={handleChange('modelType')}
        >
          <MenuItem value="gpt4omini">{translations.gpt4omini || "GPT-4o mini (default)"}</MenuItem>
          <MenuItem value="gpt4o">{translations.gpt4o || "GPT-4o"}</MenuItem>
          <MenuItem value="gpt35">{translations.gpt35 || "GPT-3.5"}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* <SettingDivider /> */}
      
      {/* Context Window Slider */}
      <Box>
        {/* Header with tooltip */}
        <SettingAlignedRow
          left={
            <Typography variant="body2" sx={commonStyles.sectionHeader}>
              {translations.contextWindow || "Context Window Size"}
            </Typography>
          }
          right={
            <Tooltip title={translations.contextWindowTooltip || "Controls how many past exchanges to include for context. Higher values provide more context but may slow responses."}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0.75 }}
        />
        
        <Box sx={commonStyles.sliderContainer}>
          <Slider
            value={pdfChatbotSettings.contextWindow}
            onChange={handleSliderChange('contextWindow')}
            aria-labelledby="context-window-slider"
            valueLabelDisplay="auto"
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 5, label: '5' }
            ]}
            min={1}
            max={5}
            size="small"
            sx={commonStyles.slider}
            disabled
          />
        </Box>
      </Box>
      
      {/* <SettingDivider /> */}
      
      {/* Temperature Slider */}
      <Box>
        <SettingAlignedRow
          left={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Thermometer size={16} style={{ marginRight: '8px' }} />
              <Typography variant="body2" sx={commonStyles.sectionHeader}>
                {translations.temperature || "Temperature"}
              </Typography>
            </Box>
          }
          right={
            <Tooltip title={translations.temperatureTooltip || "Controls randomness in responses. Lower values are more focused and deterministic, higher values are more creative and varied."}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0.75 }}
        />
        
        <Box sx={commonStyles.sliderContainer}>
          <Slider
            value={pdfChatbotSettings.temperature}
            onChange={handleSliderChange('temperature')}
            aria-labelledby="temperature-slider"
            valueLabelDisplay="auto"
            step={0.1}
            marks={[
              { value: 0, label: 'Precise' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: 'Creative' }
            ]}
            min={0}
            max={1}
            size="small"
            sx={commonStyles.slider}
            disabled
          />
        </Box>
      </Box>
      
      {/* <SettingDivider /> */}
      
      {/* Follow-up Questions Option */}
      <SettingRow
        label={translations.followupQuestions || "Suggest Follow-up Questions"}
        tooltipTitle={translations.followupTooltip || "AI will suggest relevant follow-up questions after each response"}
        control={
          <CustomSwitch 
            checked={pdfChatbotSettings.followupQuestions} 
            onChange={handleChange('followupQuestions')}
            size="small"
            disabled
          />
        }
        sx={commonStyles.formRow}
      />
      
      <SettingHelperText>
        {translations.chatHistoryNote || "Chat history is not saved after you close the session."}
      </SettingHelperText>
    </SettingsContainer>
  );
}