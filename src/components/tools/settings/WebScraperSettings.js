/**
 * Web Scraper Settings Component
 *
 * Lets users pick which AI model the Web Scraper will use, and supply
 * an API key for any non-default model.
 */

import React from 'react';
import {
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  ListSubheader,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import {
  SettingsContainer,
  SettingFormControl,
  SettingHelperText,
} from '../../../layouts';

const FREE_MODEL = 'gpt4omini';

export default function WebScraperSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations =
    getToolTranslations('webScraper', language)?.settings || {};

  const { webScraperSettings, updateWebScraperSettings } = useToolSettings();

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const next = { ...webScraperSettings, [field]: value };
    if (field === 'modelType' && value === FREE_MODEL) {
      next.apiKey = '';
      next.showKey = false;
    }
    updateWebScraperSettings(next);
    onSettingsChange(next);
  };

  const requiresKey = webScraperSettings.modelType !== FREE_MODEL;

  return (
    <SettingsContainer>
      {/* Model Selection */}
      <SettingFormControl label={translations.modelType || 'AI Model'}>
        <Select
          value={webScraperSettings.modelType}
          onChange={handleChange('modelType')}
        >
          <ListSubheader>GPT-SDPA (Free)</ListSubheader>
          <MenuItem value="gpt4omini">GPT-4o mini (default)</MenuItem>

          <ListSubheader>GPT-Azure</ListSubheader>
          <MenuItem value="gpt41mini">GPT-4.1 mini</MenuItem>
          <MenuItem value="gpt4o">GPT-4o</MenuItem>

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

      {/* API Key input — only shown for non-default models */}
      {requiresKey && (
        <SettingFormControl label="API Key">
          <TextField
            type={webScraperSettings.showKey ? 'text' : 'password'}
            value={webScraperSettings.apiKey || ''}
            onChange={handleChange('apiKey')}
            placeholder={
              webScraperSettings.modelType.startsWith('claude') ? 'sk-ant-...' :
              webScraperSettings.modelType.startsWith('gemini') ? 'AIza...' :
              webScraperSettings.modelType === 'grok-3' ? 'xai-...' : 'Your API key'
            }
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => updateWebScraperSettings({
                      ...webScraperSettings,
                      showKey: !webScraperSettings.showKey,
                    })}
                  >
                    {webScraperSettings.showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </SettingFormControl>
      )}

      <SettingHelperText>
        {translations.modelNote ||
          'GPT-4o mini is free for SDPA/OCDS users. All other models require your own API key.'}
      </SettingHelperText>
    </SettingsContainer>
  );
}