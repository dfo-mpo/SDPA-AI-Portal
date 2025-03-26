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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../../components/common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingHelperText, 
  SettingFormControl,
  SettingHeader,
  SettingDivider
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';

/**
 * Settings component for Fence Counting tool
 * 
 * @returns {JSX.Element} The rendered component
 */
export default function FenceCountingSettings() {
  const { language } = useLanguage();
  const translations = getToolTranslations("fenceCounting", language)?.settings;
  
  // Get component styles
  const commonStyles = useComponentStyles('toolSettingsCommon');
  const fenceStyles = useComponentStyles('fenceCounting');


  // Updated settings with multiple species selection
  const [settings, setSettings] = useState({
    // Species selection (default all to true)
    species: {
      sockeye: true,
      chum: true,
      chinook: true,
      coho: true,
      pink: true
    },
    direction: 'both',
    trackObjects: true
  });

  /**
   * Handle species checkbox change
   * 
   * @param {string} speciesName - The species name to toggle
   * @returns {Function} Event handler function
   */
  const handleSpeciesChange = (speciesName) => (event) => {
    const isChecked = event.target.checked;
    
    setSettings(prev => ({
      ...prev,
      species: {
        ...prev.species,
        [speciesName]: isChecked
      }
    }));
  };

  /**
   * Check if at least one species is selected
   */
  const isAtLeastOneSpeciesSelected = () => {
    return Object.values(settings.species).some(selected => selected);
  };
  
  /**
   * Handle other settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [field]: value });
  };
  
  // Warning if no species are selected
  const noSpeciesSelected = !isAtLeastOneSpeciesSelected();

  // Clean up the species names for display
  const getCleanSpeciesName = (species) => {
    if (!translations || !translations[species]) {
      // If translations not available, format the species name
      return species.charAt(0).toUpperCase() + species.slice(1);
    }
    
    // Get the translation but remove " Only" if present
    const translated = translations[species];
    return translated.replace(/ Only$/, '');
  };

  return (
    <SettingsContainer>
      {/* Direction Selection */}
      <SettingFormControl label={translations?.directionLabel} disabled>
        <Select
          value={settings.direction}
          onChange={handleChange('direction')}
        >
          <MenuItem value="both">{translations?.both || "Both Directions"}</MenuItem>
          <MenuItem value="upstream">{translations?.upstream || "Upstream"}</MenuItem>
          <MenuItem value="downstream">{translations?.downstream || "Downstream"}</MenuItem>
        </Select>
      </SettingFormControl>
      
      <SettingDivider sx={fenceStyles.divider} />
      
      {/* Species Selection with Checkboxes */}
      <Box sx={fenceStyles.speciesSection}>
        <SettingHeader label={translations?.speciesLabel} sx={fenceStyles.sectionHeader} />
        
        {/* Individual Species Checkboxes */}
        <FormGroup sx={fenceStyles.checkboxGroup}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.species.sockeye} 
                onChange={handleSpeciesChange('sockeye')}
                size="small"
              />
            }
            label={getCleanSpeciesName('sockeye')}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.species.chum} 
                onChange={handleSpeciesChange('chum')}
                size="small"
              />
            }
            label={getCleanSpeciesName('chum')}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.species.chinook} 
                onChange={handleSpeciesChange('chinook')}
                size="small"
              />
            }
            label={getCleanSpeciesName('chinook')}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.species.coho} 
                onChange={handleSpeciesChange('coho')}
                size="small"
              />
            }
            label={getCleanSpeciesName('coho')}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.species.pink} 
                onChange={handleSpeciesChange('pink')}
                size="small"
              />
            }
            label={getCleanSpeciesName('pink')}
          />
        </FormGroup>
      </Box>
      
      <SettingDivider sx={fenceStyles.divider} />
      
      {/* Object Tracking Option */}
      <SettingRow
        label={translations?.trackObjects}
        control={
          <CustomSwitch 
            checked={settings.trackObjects} 
            onChange={handleChange('trackObjects')}
            size="small"
            disabled
          />
        }
        tooltipTitle={translations?.trackObjectsTooltip}
        tooltipIcon={<HelpCircle size={16} />}
      />
  
      {/* Information about the model */}
      <SettingHelperText>
        {translations?.modelInfo}
      </SettingHelperText>
    </SettingsContainer>
  );
}