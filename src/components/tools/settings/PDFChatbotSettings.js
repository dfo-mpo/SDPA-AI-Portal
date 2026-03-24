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
  IconButton,
  TextField,
  InputAdornment,
  ListSubheader,
} from '@mui/material';
import { HelpCircle, Thermometer, Eye, EyeOff } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl,
  SettingAlignedRow
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';

const FREE_MODEL = 'gpt4omini';

export default function PDFChatbotSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations = getToolTranslations("pdfChatbot", language)?.settings || {};

  const { pdfChatbotSettings, updatePdfChatbotSettings } = useToolSettings();
  
  const commonStyles = useComponentStyles('toolSettingsCommon');
  const styles = useComponentStyles('pdfChatbotSettings');

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const updated = { ...pdfChatbotSettings, [field]: value };
    if (field === 'modelType' && value === FREE_MODEL) {
      updated.apiKey = '';
      updated.showKey = false;
    }
    updatePdfChatbotSettings(updated);
    if (onSettingsChange) onSettingsChange(updated);
  };

  const handleSliderChange = (field) => (_, value) => {
    const updated = { ...pdfChatbotSettings, [field]: value };
    updatePdfChatbotSettings(updated);
    if (onSettingsChange) onSettingsChange(updated);
  };

  const requiresKey = pdfChatbotSettings.modelType !== FREE_MODEL;

  return (
    <SettingsContainer>
      {/* Model Selection */}
      <SettingFormControl label={translations.modelType || "AI Model"}>
        <Select
          value={pdfChatbotSettings.modelType}
          onChange={handleChange('modelType')}
        >
          <ListSubheader>GPT-SDPA (Free)</ListSubheader>
          <MenuItem value="gpt4omini">GPT-4o mini (default)</MenuItem>

          <ListSubheader>GPT-Azure</ListSubheader>
          <MenuItem value="gpt4o">GPT-4o</MenuItem>
          <MenuItem value="gpt35">GPT-3.5</MenuItem>
          <MenuItem value="o3mini">o3-mini</MenuItem>

          <ListSubheader>Anthropic</ListSubheader>
          <MenuItem value="claude-35-sonnet">Claude 3.5 Sonnet</MenuItem>
          <MenuItem value="claude-3-haiku">Claude 3 Haiku</MenuItem>

          <ListSubheader>Google</ListSubheader>
          <MenuItem value="gemini-15-flash">Gemini 1.5 Flash</MenuItem>
          <MenuItem value="gemini-15-pro">Gemini 1.5 Pro</MenuItem>

          <ListSubheader>xAI</ListSubheader>
          <MenuItem value="grok-3">Grok 3</MenuItem>
        </Select>
      </SettingFormControl>

      {/* API Key input — only shown for non native models */}
      {requiresKey && (
        <SettingFormControl label="API Key">
          <TextField
            type={pdfChatbotSettings.showKey ? 'text' : 'password'}
            value={pdfChatbotSettings.apiKey || ''}
            onChange={handleChange('apiKey')}
            placeholder={
              pdfChatbotSettings.modelType.startsWith('claude') ? 'sk-ant-...' :
              pdfChatbotSettings.modelType.startsWith('gemini') ? 'AIza...' :
              pdfChatbotSettings.modelType === 'grok-3' ? 'xai-...' : 'Your API key'
            }
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => updatePdfChatbotSettings({
                      ...pdfChatbotSettings,
                      showKey: !pdfChatbotSettings.showKey
                    })}
                  >
                    {pdfChatbotSettings.showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </SettingFormControl>
      )}

      {/* Context Window Slider */}
      <Box>
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
            marks={[{ value: 1, label: '1' }, { value: 5, label: '5' }]}
            min={1}
            max={5}
            size="small"
            sx={commonStyles.slider}
            disabled
          />
        </Box>
      </Box>

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

      {/* Follow-up Questions */}
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