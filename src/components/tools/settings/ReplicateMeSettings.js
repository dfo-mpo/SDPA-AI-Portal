/**
 * Replicate Me Settings Component
 *
 * Lets users pick which AI model the Replicate Me chatbot will use,
 * and supply an API key for any non-default model.
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

export default function ReplicateMeSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations =
    getToolTranslations('replicateMe', language)?.settings || {};

  const { replicateMeSettings, updateReplicateMeSettings } = useToolSettings();

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const next = { ...replicateMeSettings, [field]: value };
    // Clear API key when switching back to the free default model
    if (field === 'modelType' && value === FREE_MODEL) {
      next.apiKey = '';
      next.showKey = false;
    }
    updateReplicateMeSettings(next);
    onSettingsChange(next);
  };

  const requiresKey = replicateMeSettings.modelType !== FREE_MODEL;

  return (
    <SettingsContainer>
      {/* Model Selection */}
      <SettingFormControl label={translations.modelType || 'AI Model'}>
        <Select
          value={replicateMeSettings.modelType}
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
            type={replicateMeSettings.showKey ? 'text' : 'password'}
            value={replicateMeSettings.apiKey || ''}
            onChange={handleChange('apiKey')}
            placeholder={
              replicateMeSettings.modelType.startsWith('claude') ? 'sk-ant-...' :
              replicateMeSettings.modelType.startsWith('gemini') ? 'AIza...' :
              replicateMeSettings.modelType === 'grok-3' ? 'xai-...' : 'Your API key'
            }
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => updateReplicateMeSettings({
                      ...replicateMeSettings,
                      showKey: !replicateMeSettings.showKey,
                    })}
                  >
                    {replicateMeSettings.showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </SettingFormControl>
      )}

      <SettingHelperText>
        {requiresKey
          ? 'Your key is sent only with this request and is never stored or logged.'
          : 'GPT-4o mini is free for OCDS users. Select another model to use your own API key.'}
      </SettingHelperText>
    </SettingsContainer>
  );
}