/**
 * French Translation Settings Component
 * 
 * Settings panel for the French Translation tool. Allows users to configure
 * the translation model type and formatting preservation options.
 */

import React, { useState } from 'react';
import { 
  Select, 
  MenuItem,
} from '@mui/material';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../../components/common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl 
} from '../../../layouts';
// import { useComponentStyles } from '../../../styles/new/hooks/useComponentStyles';

export default function FrenchTranslationSettings() {
  const { language } = useLanguage();
  const translations = getToolTranslations("frenchTranslator", language)?.settings || {};

  // Settings state
  const [settings, setSettings] = useState({
    modelType: 'scientific',
    preserveFormatting: true
  });

  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Get centralized dropdown styles
//   const dropdownStyles = useComponentStyles('dropdown');

  return (
    <SettingsContainer>
      {/* Model Type Selection */}
      <SettingFormControl label={translations.modelType}>
        <Select
          value={settings.modelType}
          onChange={handleChange('modelType')}
        //   sx={dropdownStyles.select}
        disabled
        >
          <MenuItem value="scientific">{translations.modelScientific}</MenuItem>
          <MenuItem value="hr">{translations.modelHR}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Preserve Formatting */}
      <SettingRow
        label={translations.preserveFormatting}
        tooltipTitle={translations.preserveFormattingTooltip}
        control={
          <CustomSwitch 
            checked={settings.preserveFormatting} 
            onChange={handleChange('preserveFormatting')}
            size="small"
            disabled
          />
        }
      />
      
      {/* Helper text at the bottom */}
      <SettingHelperText>
        {translations.modelInfo}
      </SettingHelperText>
    </SettingsContainer>
  );
}
