/**
 * PDF Chatbot Settings Component
 * 
 * Settings panel for the PDF Chatbot tool. Allows users to configure the AI model,
 * context window size, and follow-up question suggestions for the PDF Chatbot.
 */

import React, { useState } from 'react';
import { 
  Select, 
  MenuItem,
  Box,
  Slider,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts';
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
// import { toolSettingsCommonStyles } from '../../../styles/new/componentStyles';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';


export default function PDFChatbotSettings() {
  const { language } = useLanguage();
  const translations = getToolTranslations("pdfChatbot", language)?.settings || {};

  // Settings state
  const [settings, setSettings] = useState({
    modelType: 'gpt4omini',
    contextWindow: 3, // Number of past responses to include
    followupQuestions: true
  });

  // Use centralized common styles
  const commonStyles = useComponentStyles('toolSettingsCommon');
//   const dropdownStyles = useComponentStyles('dropdown');


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
   * Handle slider value change
   * 
   * @param {Event} event - The change event
   * @param {number} value - The new slider value
   */
  const handleSliderChange = (_, value) => {
    setSettings({ ...settings, contextWindow: value });
  };

  return (
    <SettingsContainer>
      {/* Model Selection */}
      <SettingFormControl label={translations.modelType || "AI Model"}>
        <Select
          value={settings.modelType}
          onChange={handleChange('modelType')}
        //   sx={dropdownStyles.select}
        >
          <MenuItem value="gpt4omini">{translations.gpt4omini || "GPT-4o mini (default)"}</MenuItem>
          <MenuItem value="gpt4o">{translations.gpt4o || "GPT-4o"}</MenuItem>
          <MenuItem value="gpt35">{translations.gpt35 || "GPT-3.5"}</MenuItem>
        </Select>
      </SettingFormControl>
      
      <SettingDivider />
      
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
            value={settings.contextWindow}
            onChange={handleSliderChange}
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
          />
        </Box>
      </Box>
      
      <SettingDivider />
      
      {/* Follow-up Questions Option */}
      <SettingRow
        label={translations.followupQuestions || "Suggest Follow-up Questions"}
        tooltipTitle={translations.followupTooltip || "AI will suggest relevant follow-up questions after each response"}
        control={
          <CustomSwitch 
            checked={settings.followupQuestions} 
            onChange={handleChange('followupQuestions')}
            size="small"
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
