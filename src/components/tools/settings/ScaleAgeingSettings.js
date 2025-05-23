import React from 'react';
import {
  Select, 
  MenuItem,
} from '@mui/material';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl 
} from '../../../layouts';

export default function ScaleAgeingSettings() {
  const { language } = useLanguage();
  const translations = getToolTranslations("scaleAgeing", language)?.settings;
  
  // access the tool settings context
  const { scaleAgeingSettings, setScaleAgeingSettings } = useToolSettings();
  // Destructure the relevant fields
  const {species, enhance } = scaleAgeingSettings;

  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
    ? event.target.checked
    : event.target.value;
    
    // Update the settings state
    setScaleAgeingSettings((prev) => ({ 
      ...prev, [field]: value 
    }));
  };

  return (
    <SettingsContainer>
      {/* Salmon Species Selection */}
      <SettingFormControl label={translations.speciesLabel}>
        <Select
          value={species}
          onChange={handleChange('species')}
        >
          <MenuItem value="chum">{translations.chum}</MenuItem>
          <MenuItem value="coho" disabled >{translations.coho}</MenuItem>
          <MenuItem value="chinook" disabled>{translations.chinook}</MenuItem>
          <MenuItem value="sockeye" disabled>{translations.sockeye}</MenuItem>
          <MenuItem value="pink" disabled>{translations.pink}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Image Enhancement Option with Tooltip */}
      <SettingRow
        label={translations.enhanceLabel + (" **Coming soon**")}
        control={
          <CustomSwitch 
            checked={enhance} 
            onChange={handleChange('enhance')}
            size="small"
            disabled={true}
          />
        }
        tooltipTitle={translations.enhanceTooltip}
      />
      
      {/* Information about the model */}
      <SettingHelperText>
        {translations.modelInfo}
      </SettingHelperText>
    </SettingsContainer>
  );
}