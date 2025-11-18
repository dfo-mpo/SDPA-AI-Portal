import React from 'react';
import { 
  Box, 
  Checkbox,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import { RotateCcw } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import { CustomSwitch } from '../../common';
import { 
  SettingsContainer, 
  SettingRow, 
  SettingCheckboxGroup,
  SettingHeader,
  SettingDivider
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';
import { trackEvent } from '../../../utils/analytics';

export default function SensitivityScoreSettings() {
  const { language } = useLanguage();
  const sensitivityScoreStyles = useComponentStyles('sensitivityScore');
  const translations = getToolTranslations("sensitivityScore", language)?.settings;
  
  // Use the context for settings
  const { 
    sensitivityScoreSettings, 
    setSensitivityScoreSettings,
    toggleSensitivityAdvanced  // Use the shared toggle function
  } = useToolSettings();

  // Get showAdvanced state from the shared context
  const showAdvanced = sensitivityScoreSettings.showAdvanced;

  /**
   * Handle settings change
   * 
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSensitivityScoreSettings({ ...sensitivityScoreSettings, [field]: value });
  };

  /**
   * Handle weight value change
   * 
   * @param {string} category - The category to update
   * @returns {Function} Event handler function 
   */
  const handleWeightChange = (category) => (event) => {
    const inputValue = event.target.value.replace(/[^0-9]/g, '');
    const value = inputValue === '' ? 0 : Number(inputValue);
    if (value > 100) return;

    const newWeights = { ...sensitivityScoreSettings.weights, [category]: value };
    setSensitivityScoreSettings({ ...sensitivityScoreSettings, weights: newWeights });
  };

  /**
   * Reset weights to default values
   */
  const resetWeights = () => {
    setSensitivityScoreSettings({
      ...sensitivityScoreSettings,
      weights: {
        personalInfo: 25,
        businessInfo: 25,
        scientificData: 25,
        locationData: 25
      }
    });
  };

  // Calculate total weight and check if valid
  const totalWeight = Object.values(sensitivityScoreSettings.weights).reduce((sum, weight) => sum + weight, 0);
  const isWeightValid = totalWeight === 100;

  return (
    <SettingsContainer>
      {/* Category checkboxes using the SettingCheckboxGroup */}
      <SettingCheckboxGroup 
        label={translations.checkLabel} 
        tooltipTitle={translations.checkTooltip}
      >
        <SettingRow
          label={translations.categories.personalInfo}
          control={
            <Checkbox 
              checked={sensitivityScoreSettings.checkPersonalInfo} 
              onChange={handleChange('checkPersonalInfo')} 
              size="small"
              disabled
              // disabled={showAdvanced} // TODO: UNCOMMENT when above checkbox is fixed
              />
          }
          sx={{ 
            justifyContent: 'flex-start', 
            width: 'auto', 
            mb: 0, 
            opacity: showAdvanced ? 0.6 : 1 }}
        />
        
        <SettingRow
          label={translations.categories.businessInfo}
          control={
            <Checkbox 
              checked={sensitivityScoreSettings.checkBusinessInfo} 
              onChange={handleChange('checkBusinessInfo')} 
              size="small" 
              // disabled={showAdvanced} // TODO: UNCOMMENT when above checkbox is fixed
              disabled
            />
          }
          sx={{ 
            justifyContent: 'flex-start', 
            width: 'auto', 
            mb: 0, opacity: 
            showAdvanced ? 0.6 : 1  }}
        />
        
        <SettingRow
          label={translations.categories.scientificData}
          control={
            <Checkbox 
              checked={sensitivityScoreSettings.checkScientificData} 
              onChange={handleChange('checkScientificData')} 
              size="small"
              // disabled={showAdvanced} // TODO: UNCOMMENT when above checkbox is fixed
              disabled
              />
          }
          sx={{ 
            justifyContent: 'flex-start', 
            width: 'auto', 
            mb: 0,
            opacity: showAdvanced ? 0.6 : 1  
          }}
        />
        
        <SettingRow
          label={translations.categories.locationData}
          control={
            <Checkbox 
              checked={sensitivityScoreSettings.checkLocationData} 
              onChange={handleChange('checkLocationData')} 
              size="small"
              // disabled={showAdvanced} // TODO: UNCOMMENT when above checkbox is fixed
              disabled
              />
          }
          sx={{ 
            justifyContent: 'flex-start', 
            width: 'auto', 
            mb: 0,
            opacity: showAdvanced ? 0.6 : 1  
          }}
        />
      </SettingCheckboxGroup>

      {/* Auto-flag toggle using CustomSwitch */}
      <SettingRow
        label={translations.autoFlagLabel || "Auto-flag sensitive documents"}
        tooltipTitle={translations.autoFlagTooltip || "Automatically flag documents that exceed the sensitivity threshold"}
        control={
          <CustomSwitch 
            checked={sensitivityScoreSettings.autoFlag} 
            onChange={handleChange('autoFlag')}
            size="small"
            disabled
          />
        }
      />

      {/* Advanced Settings Toggle */}
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => {
          trackEvent(
            'Sensitivity Settings', 
            showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings', 
            'Sensitivity Panel Toggle'
          );
          toggleSensitivityAdvanced();
        }}
        sx={sensitivityScoreStyles.button}
      >
        {showAdvanced ? translations.hideAdvancedSettings : translations.advancedSettings}
      </Button>

      {/* Advanced Settings - Category Weights */}
      {showAdvanced && (
        <Box>
          {/* <SettingDivider /> */}
          
          <Box sx={sensitivityScoreStyles.flexBetween}>
            <SettingHeader 
              label={translations.weightsLabel} 
              tooltipTitle={translations.weightsTooltip} 
              sx={{ 
                mb: 0,
                ...(isWeightValid ? {} : sensitivityScoreStyles.headerLabelError)
              }}
            />
            <IconButton 
              size="small" 
              onClick={() => {
                trackEvent('Sensitivity Settings', 'Reset Weights', 'Reset Button Click');
                resetWeights();
              }}
              color="primary"
              aria-label="Reset weights"
              sx={sensitivityScoreStyles.resetButton}
            >
              <RotateCcw size={14} />
            </IconButton>
          </Box>

          <Box 
            display="grid"
            gridTemplateColumns="3fr 1fr"
            rowGap={1}
            columnGap={1}
            sx={sensitivityScoreStyles.weightGrid}
          >
            {/* Personal Info Weight */}
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.weightLabel,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightLabelError)
              }}
            >
              {translations.categories.personalInfo}
            </Typography>
            <TextField
              size="small"
              value={sensitivityScoreSettings.weights.personalInfo}
              onChange={handleWeightChange('personalInfo')}
              variant="outlined"
              error={!isWeightValid}
              inputProps={{
                min: 0,
                max: 100,
                type: 'text',
                'aria-label': translations.categories.personalInfo,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{
                ...sensitivityScoreStyles.weightInput,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightInputError)
              }}
              disabled
            />
            
            {/* Business Info Weight */}
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.weightLabel,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightLabelError)
              }}
            >
              {translations.categories.businessInfo}
            </Typography>
            <TextField
              size="small"
              value={sensitivityScoreSettings.weights.businessInfo}
              onChange={handleWeightChange('businessInfo')}
              variant="outlined"
              error={!isWeightValid}
              inputProps={{
                min: 0,
                max: 100,
                type: 'text',
                'aria-label': translations.categories.businessInfo,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{
                ...sensitivityScoreStyles.weightInput,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightInputError)
              }}
              disabled
            />
            
            {/* Scientific Data Weight */}
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.weightLabel,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightLabelError)
              }}
            >
              {translations.categories.scientificData}
            </Typography>
            <TextField
              size="small"
              value={sensitivityScoreSettings.weights.scientificData}
              onChange={handleWeightChange('scientificData')}
              variant="outlined"
              error={!isWeightValid}
              inputProps={{
                min: 0,
                max: 100,
                type: 'text',
                'aria-label': translations.categories.scientificData,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{
                ...sensitivityScoreStyles.weightInput,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightInputError)
              }}
              disabled
            />
            
            {/* Location Data Weight */}
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.weightLabel,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightLabelError)
              }}
            >
              {translations.categories.locationData}
            </Typography>
            <TextField
              size="small"
              value={sensitivityScoreSettings.weights.locationData}
              onChange={handleWeightChange('locationData')}
              variant="outlined"
              error={!isWeightValid}
              inputProps={{
                min: 0,
                max: 100,
                type: 'text',
                'aria-label': translations.categories.locationData,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{
                ...sensitivityScoreStyles.weightInput,
                ...(isWeightValid ? {} : sensitivityScoreStyles.weightInputError)
              }}
              disabled
            />
          </Box>

          <Box sx={{
            ...sensitivityScoreStyles.totalBox,
            ...(isWeightValid ? {} : sensitivityScoreStyles.totalBoxError)
          }}>
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.totalLabel,
                ...(isWeightValid ? {} : sensitivityScoreStyles.totalLabelError)
              }}
            >
              {translations.total}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                ...sensitivityScoreStyles.totalValue,
                ...(isWeightValid ? {} : sensitivityScoreStyles.totalValueError)
              }}
            >
              {totalWeight}%
            </Typography>
          </Box>

          {!isWeightValid && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="body2" color="error" fontWeight={500}>
                {translations.weightError || "Weights must add up to exactly 100%"}
              </Typography>
              <Typography variant="caption" color="error.dark">
                You won't be able to upload a document until the weights total exactly 100%.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </SettingsContainer>
  );
}