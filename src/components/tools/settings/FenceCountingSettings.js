/**
 * Fence Counting Settings Component
 * 
 * Settings panel for the Fence Counting tool. Allows users to configure the 
 * species detection, movement direction, and object tracking options.
 */

import React, { useState } from 'react';
import { 
  Select, 
  MenuItem,
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
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

/**
 * Settings component for Fence Counting tool
 * 
 * @returns {JSX.Element} The rendered component
 */
export default function FenceCountingSettings() {
  const { language } = useLanguage();

  const translations = getToolTranslations("fenceCounting", language)?.settings;
  // const dropdownStyles = useComponentStyles('dropdown');

  // Settings state
  const [settings, setSettings] = useState({
    species: 'all',
    direction: 'both',
    trackObjects: true
  });

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

  return (
    <SettingsContainer>
      {/* Species to Count */}
      <SettingFormControl label={translations.speciesLabel}>
        <Select
          value={settings.species}
          onChange={handleChange('species')}
          // sx={dropdownStyles.select}
        >
          <MenuItem value="all">{translations.all}</MenuItem>
          <MenuItem value="sockeye">{translations.sockeye}</MenuItem>
          <MenuItem value="chum">{translations.chum}</MenuItem>
          <MenuItem value="chinook">{translations.chinook}</MenuItem>
          <MenuItem value="coho">{translations.coho}</MenuItem>
          <MenuItem value="pink">{translations.pink}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Direction */}
      <SettingFormControl label={translations.directionLabel}>
        <Select
          value={settings.direction}
          onChange={handleChange('direction')}
          // sx={dropdownStyles.select}
        >
          <MenuItem value="both">{translations.both}</MenuItem>
          <MenuItem value="upstream">{translations.upstream}</MenuItem>
          <MenuItem value="downstream">{translations.downstream}</MenuItem>
        </Select>
      </SettingFormControl>
      
      {/* Object Tracking Option */}
      <SettingRow
        label={translations.trackObjects}
        control={
          <CustomSwitch 
            checked={settings.trackObjects} 
            onChange={handleChange('trackObjects')}
            size="small"
          />
        }
        tooltipTitle={translations.trackObjectsTooltip}
        tooltipIcon={<HelpCircle size={16} />}
      />

      {/* Information about the model */}
      <SettingHelperText>
        {translations.modelInfo}
      </SettingHelperText>
    </SettingsContainer>
  );
}