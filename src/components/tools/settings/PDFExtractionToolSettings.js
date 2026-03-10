/**
 * PDF Extraction Tool Settings Component
 *
 * Lets users pick an AI model for the PDF Extraction Tool.
 * - GPT-4o mini is the SDPA/OCDS default and requires no API key.
 * - Every other model requires the user to paste their own API key.
 *   That key is held only in React state for the current session and
 *   is never persisted or logged.
 */

import React from 'react';
import {
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import {
  SettingsContainer,
  SettingFormControl,
  SettingHelperText,
} from '../../../layouts';

// ─── Model catalogue ───────────────────────────────────────────────────────
// Each entry: { value: <key sent to backend>, label: <display name> }
// Groups are rendered as disabled header MenuItems for visual separation.
const MODEL_GROUPS = [
  {
    group: 'GPT – SDPA/OCDS (no key required)',
    items: [
      { value: 'gpt4omini', label: 'GPT-4o mini (default)' },
    ],
  },
  {
    group: 'GPT – Azure (bring your own key)',
    items: [
      { value: 'gpt4o',    label: 'GPT-4o' },
      { value: 'gpt41mini', label: 'GPT-4.1 mini' },
    ],
  },
  {
    group: 'Claude – Anthropic',
    items: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-haiku',    label: 'Claude 3 Haiku' },
    ],
  },
  {
    group: 'Gemini – Google',
    items: [
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    group: 'Grok – xAI',
    items: [
      { value: 'grok-2', label: 'Grok 3' },
    ],
  },
];

// The only model that uses the shared SDPA/OCDS Azure key (no user input needed)
const FREE_MODEL = 'gpt4omini';

// ─── Component ─────────────────────────────────────────────────────────────
export default function PDFExtractionToolSettings({ onSettingsChange = () => {} }) {
  const { language } = useLanguage();
  const translations =
    getToolTranslations('pdfExtractionTool', language)?.settings || {};

  const { PDFExtractionToolSettings, updatePDFExtractionToolSettings } =
    useToolSettings();

  const selectedModel = PDFExtractionToolSettings?.modelType || FREE_MODEL;
  const apiKey        = PDFExtractionToolSettings?.apiKey    || '';
  const showKey       = PDFExtractionToolSettings?.showKey   || false;
  const needsKey      = selectedModel !== FREE_MODEL;

  // Generic field updater
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const next  = { ...PDFExtractionToolSettings, [field]: value };

    // Clear the stored key whenever the user switches back to the free model
    if (field === 'modelType' && value === FREE_MODEL) {
      next.apiKey  = '';
      next.showKey = false;
    }

    updatePDFExtractionToolSettings(next);
    onSettingsChange(next);
  };

  // Toggle key visibility
  const toggleShowKey = () => {
    const next = { ...PDFExtractionToolSettings, showKey: !showKey };
    updatePDFExtractionToolSettings(next);
  };

  // ── Helper: which provider hint to show ──────────────────────────────────
  const providerHint = () => {
    if (!needsKey) return null;
    if (selectedModel.startsWith('claude'))  return 'Anthropic API key  (sk-ant-…)';
    if (selectedModel.startsWith('gemini'))  return 'Google AI Studio API key  (AIza…)';
    if (selectedModel.startsWith('grok'))    return 'xAI API key  (xai-…)';
    return 'Azure OpenAI API key for this deployment';
  };

  return (
    <SettingsContainer>

      {/* ── Model selector ───────────────────────────────────────────────── */}
      <SettingFormControl label={translations.modelType || 'AI Model'}>
        <Select
          value={selectedModel}
          onChange={handleChange('modelType')}
          size="small"
        >
          {MODEL_GROUPS.map(({ group, items }) => [
            /* Group header – not selectable */
            <MenuItem
              key={group}
              disabled
              sx={{
                opacity: 0.55,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                mt: 0.5,
              }}
            >
              {group}
            </MenuItem>,

            /* Selectable models inside this group */
            ...items.map(({ value, label }) => (
              <MenuItem key={value} value={value} sx={{ pl: 3 }}>
                {label}
              </MenuItem>
            )),
          ])}
        </Select>
      </SettingFormControl>

      {/* ── API key input – only shown for non-free models ───────────────── */}
      {needsKey && (
        <SettingFormControl
          label={translations.apiKey || `API Key – ${providerHint()}`}
        >
          <TextField
            size="small"
            fullWidth
            type={showKey ? 'text' : 'password'}
            placeholder={translations.apiKeyPlaceholder || 'Paste your API key here…'}
            value={apiKey}
            onChange={handleChange('apiKey')}
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={toggleShowKey}
                    edge="end"
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </SettingFormControl>
      )}

      {/* ── Helper text ──────────────────────────────────────────────────── */}
      <SettingHelperText>
        {needsKey
          ? (translations.apiKeyNote ||
              'Your key is sent only with this request and is never stored or logged.')
          : (translations.modelNote ||
              'GPT-4o mini is provided by SDPA/OCDS. Select another model to use your own API key.')}
      </SettingHelperText>

    </SettingsContainer>
  );
}