import React from 'react';
import {
  Radio,
  RadioGroup,
  Checkbox,
  Box,
  Tooltip,
  IconButton,
  FormControlLabel,
  FormGroup,
  Slider,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useLanguage, useToolSettings } from '../../../contexts';
import { getToolTranslations } from '../../../utils';
import {
  SettingsContainer,
  SettingHeader,
  SettingHelperText,
  SettingRow,
  SettingAlignedRow,
  SettingDivider
} from '../../../layouts';
import { useComponentStyles } from '../../../styles/hooks/useComponentStyles';

export default function PIIRedactorSettings() {
  const { language } = useLanguage();
  const commonStyles = useComponentStyles('toolSettingsCommon');
  const translations = getToolTranslations('piiRedactor', language)?.settings;
  
  // Use global settings context
  const { piiRedactorSettings, setPiiRedactorSettings } = useToolSettings();

  /**
   * Handle redaction method change
   * 
   * @param {Object} event - Change event
   */
  const handleMethodChange = (event) => {
    const newMethod = event.target.value;
    console.log(`Changing redaction method from ${piiRedactorSettings.redactionMethod} to ${newMethod}`);
    
    setPiiRedactorSettings({
      ...piiRedactorSettings,
      redactionMethod: newMethod
    });
  };

  /**
   * Handle redaction color change
   * 
   * @param {Object} event - Change event
   */
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    console.log(`Changing redaction color from ${piiRedactorSettings.redactionColor} to ${newColor}`);
    
    setPiiRedactorSettings({
      ...piiRedactorSettings,
      redactionColor: newColor
    });
  };

  /**
   * Handle detection sensitivity change
   * 
   * @param {Object} event - Change event
   * @param {number} newValue - New slider value
   */
  const handleSensitivityChange = (event, newValue) => {
    console.log(`Changing detection sensitivity from ${piiRedactorSettings.detectionSensitivity} to ${newValue}`);
    
    setPiiRedactorSettings({
      ...piiRedactorSettings,
      detectionSensitivity: newValue
    });
  };

  /**
   * Handle category checkbox change
   * 
   * @param {string} category - Category key
   * @param {boolean} checked - New checkbox state
   */
  const handleCategoryChange = (category, checked) => {
    console.log(`Changing category ${category} to ${checked ? 'enabled' : 'disabled'}`);
    
    // Update the category enabled state
    setPiiRedactorSettings({
      ...piiRedactorSettings,
      categories: {
        ...piiRedactorSettings.categories,
        [category]: {
          ...piiRedactorSettings.categories[category],
          enabled: checked
        }
      }
    });
  };

  return (
    <SettingsContainer>
      {/* Redaction Method Section */}
      <Box>
        <SettingHeader label={translations?.redactionMethod || "Redaction Method"} />
        <RadioGroup
          value={piiRedactorSettings.redactionMethod}
          onChange={handleMethodChange}
          sx={commonStyles.radioGroup}
        >
          <Box>
            {/* Option 1: "Mask" with color picker */}
            <Box sx={commonStyles.optionRow}>
              {/* Left side: radio + label */}
              <Box sx={commonStyles.flexBetween}>
                <FormControlLabel
                  control={
                    <Radio
                      size="small"
                      value="mask"
                      checked={piiRedactorSettings.redactionMethod === 'mask'}
                      onChange={handleMethodChange}
                    />
                  }
                  label={"Mask with solid color"}
                  sx={{ m: 0 }}
                />
              </Box>
              {/* Right side: fixed width container for color picker */}
              <Box sx={commonStyles.fixedWidthContainer}>
                <Box
                  component="input"
                  type="color"
                  value={piiRedactorSettings.redactionColor}
                  onChange={handleColorChange}
                  aria-label={translations?.redactionColorLabel || "Redaction Color"}
                  sx={commonStyles.colorPicker}
                  disabled={piiRedactorSettings.redactionMethod !== 'mask'}
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
                      checked={piiRedactorSettings.redactionMethod === 'typePlaceholder'}
                      onChange={handleMethodChange}
                    />
                  }
                  label={translations?.useTypeLabel || "Use [TYPE] placeholders"}
                  sx={{ m: 0 }}
                />
              </Box>
              {/* Right side: fixed width container for tooltip */}
              <Box sx={commonStyles.fixedWidthContainer}>
                <Tooltip title={translations?.useTypeTooltip || "Replaces sensitive information with its type in brackets. E.g., [EMAIL]"}>
                  <IconButton size="small">
                    <HelpCircle size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </RadioGroup>
      </Box>

      <SettingDivider />

      {/* Detection Sensitivity Section */}
      <Box sx={{ mb: -3 }}>
        <SettingAlignedRow
          left={<SettingHeader label={translations?.detectionSensitivity || "Detection Sensitivity"} sx={{ mb: 0 }} />}
          right={
            <Tooltip title={translations?.detectionSensitivityTooltip || "Adjust how aggressively the system detects potential PII"}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0.75 }}
        />

        <Box sx={{ px: 2, mt: 2, mb: 1 }}>
          <Slider
            value={piiRedactorSettings.detectionSensitivity}
            onChange={handleSensitivityChange}
            min={1}
            max={10}
            step={1}
            marks={[
              { value: 1, label: translations?.sensitivityLow || 'Conservative' },
              { value: 5, label: translations?.sensitivityMedium || 'Balanced' },
              { value: 10, label: translations?.sensitivityHigh || 'Aggressive' },
            ]}
            sx={commonStyles.slider}
          />
        </Box>
        
        <Box sx={{ px: 2, mt: 1, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {translations?.sensitivityDescription || 
              "Conservative: Fewer false positives, might miss some PII. Aggressive: Catches more PII, might redact non-sensitive text."}
          </Typography>
        </Box>
      </Box>

      <SettingDivider />

      {/* Information Categories Section - Enhanced with Canadian-specific items */}
      <Box sx={{ mt: -2 }}>
        <SettingAlignedRow
          left={<SettingHeader label={translations?.infoToRedact || "Information Types to Redact"} sx={{ mb: 0 }} />}
          right={
            <Tooltip title={translations?.infoTooltip || "Select which categories of information should be identified and redacted"}>
              <IconButton size="small">
                <HelpCircle size={16} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 1 }}
        />
        
        <Box sx={{ mt: 1}}>
          {/* Category checkboxes with descriptions */}
          {Object.entries(piiRedactorSettings.categories).map(([category, settings]) => (
            <Paper 
              key={category} 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                mb: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={settings.enabled} 
                    onChange={(e) => handleCategoryChange(category, e.target.checked)} 
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    {translations?.categories?.[category] || getCategoryDisplayName(category)}
                  </Typography>
                }
                sx={{ mb: 0.5 }}
              />
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', ml: 4 }}
              >
                {translations?.categories?.[`${category}_DESC`] || settings.description}
              </Typography>
              
              {/* Enhanced description for Canadian-specific information */}
              {category === 'PERSONAL_IDENTIFIERS' && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  sx={{ display: 'block', ml: 4, mt: 0.5, fontStyle: 'italic' }}
                >
                  Includes Canadian SINs and PRIs (Personal Record Identifiers)
                </Typography>
              )}
              
              {category === 'CONTACT_INFO' && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  sx={{ display: 'block', ml: 4, mt: 0.5, fontStyle: 'italic' }}
                >
                  Includes Canadian postal codes (e.g., V6C 3R2)
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Helper Text */}
      <SettingHelperText>
        {translations?.redactorHelperText || "All redaction is performed locally in your browser. No sensitive data is sent to any server."}
      </SettingHelperText>
    </SettingsContainer>
  );
}

/**
 * Helper function to format category names for display
 * 
 * @param {string} category - Category key
 * @returns {string} Formatted display name
 */
function getCategoryDisplayName(category) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}