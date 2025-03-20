/**
 * PII Redactor Settings Component
 * 
 * Settings panel for the PII Redactor tool. Allows users to configure redaction
 * methods, redaction color, and which types of personal information to redact.
 */

import React, { useState } from 'react';
import {
  Radio,
  RadioGroup,
  Checkbox,
  Box,
  Tooltip,
  IconButton,
  FormControlLabel,
  FormGroup,
  useTheme
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import {
  SettingsContainer,
  SettingHeader,
  SettingHelperText,
  SettingRow,
  SettingAlignedRow
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';


export default function PIIRedactorSettings() {
  const { language } = useLanguage();
  const commonStyles = useComponentStyles('toolSettingsCommon');
  const translations = getToolTranslations('piiRedactor', language)?.settings;

  // Settings state
  const [settings, setSettings] = useState({
    redactionMethod: 'mask',
    redactionColor: '#000000', // default color black
    entities: {
      PERSON: true,
      EMAIL_ADDRESS: true,
      PHONE_NUMBER: true,
      ADDRESS: true,
      SIN: true,
      CREDIT_CARD: true
    }
  });

  /**
   * Handle redaction method change
   * 
   * @param {Object} event - Change event
   */
  const handleMethodChange = (event) => {
    setSettings({ ...settings, redactionMethod: event.target.value });
  };

  /**
   * Handle redaction color change
   * 
   * @param {Object} event - Change event
   */
  const handleColorChange = (event) => {
    setSettings({ ...settings, redactionColor: event.target.value });
  };

  /**
   * Handle entity checkbox change
   * 
   * @param {Object} event - Change event
   */
  const handleEntityChange = (event) => {
    const newEntities = { 
      ...settings.entities,
      [event.target.name]: event.target.checked 
    };
    setSettings({ ...settings, entities: newEntities });
  };

  return (
    <SettingsContainer>
      {/* Redaction Method Section */}
      <Box>
        <SettingHeader label={translations.redactionMethod} />
        <RadioGroup
          value={settings.redactionMethod}
          onChange={handleMethodChange}
          sx={commonStyles.radioGroup}
        >
          <Box>
            {/* Option 1: "Mask" with disguised color picker */}
            <Box sx={commonStyles.optionRow}>
              {/* Left side: radio + label */}
              <Box sx={commonStyles.flexBetween}>
                <FormControlLabel
                  control={
                    <Radio
                      size="small"
                      value="mask"
                      checked={settings.redactionMethod === 'mask'}
                      onChange={handleMethodChange}
                    />
                  }
                  label={
                    translations.mask
                      ? translations.mask.replace('███', '').trim()
                      : "Mask"
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              {/* Right side: fixed width container for color picker */}
              <Box sx={commonStyles.fixedWidthContainer}>
                <Box
                  component="input"
                  type="color"
                  value={settings.redactionColor}
                  onChange={handleColorChange}
                  aria-label={translations.redactionColorLabel}
                  sx={commonStyles.colorPicker}
                />
              </Box>
            </Box>

            {/* Option 2: "Use [TYPE]" with tooltip */}
            <Box sx={commonStyles.radioTypeRow}>
              {/* Left side: radio + label */}
              <Box sx={commonStyles.flexBetween}>
                <FormControlLabel
                  control={
                    <Radio
                      size="small"
                      value="typePlaceholder"
                      checked={settings.redactionMethod === 'typePlaceholder'}
                      onChange={handleMethodChange}
                    />
                  }
                  label={translations.useTypeLabel}
                  sx={{ m: 0 }}
                />
              </Box>
              {/* Right side: fixed width container for tooltip */}
              <Box sx={commonStyles.fixedWidthContainer}>
                <Tooltip title={translations.useTypeTooltip}>
                  <IconButton size="small">
                    <HelpCircle size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </RadioGroup>
      </Box>

      {/* Entities to Redact Section */}
      <Box>
        <SettingAlignedRow
          left={<SettingHeader label={translations.infoToRedact} sx={{ mb: 0 }} />}
          right={
            <Tooltip title={translations.infoTooltip}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0.75 }}
        />
        
        <FormGroup sx={commonStyles.checkboxGroup}>
          {Object.entries(settings.entities).map(([entityKey, value]) => (
            <SettingRow
              key={entityKey}
              label={translations.entities?.[entityKey] || entityKey}
              control={
                <Checkbox 
                  checked={value} 
                  onChange={handleEntityChange} 
                  name={entityKey} 
                  size="small" 
                />
              }
              sx={{ justifyContent: 'flex-start', width: 'auto', mb: 0 }}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Helper Text */}
      <SettingHelperText>
        {translations.redactorHelperText}
      </SettingHelperText>
    </SettingsContainer>
  );
}
