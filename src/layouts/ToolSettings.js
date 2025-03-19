/**
 * Settings Layout Components
 * 
 * A collection of reusable layout components for tool settings panels.
 * These components provide consistent spacing, alignment, and styling
 * for common settings patterns across the application.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormControlLabel,
  Tooltip,
  IconButton,
  FormControl,
  Divider
} from '@mui/material';
import { HelpCircle } from 'lucide-react';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';

/**
 * Container for all settings content with consistent spacing
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render inside the container
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingsContainer({ children, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');
  
  return (
    <Box 
      sx={{ 
        ...settingsStyles.container,
        ...props.sx
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Enhanced FormControl with better label spacing for form inputs
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the form control
 * @param {React.ReactNode} props.children - Form input element
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingFormControl({ label, children, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');
  
  const labelId = `${label.toLowerCase().replace(/\s+/g, '-')}-label`;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Separate label with proper spacing */}
      <Typography 
        component="label" 
        htmlFor={labelId}
        variant="body2" 
        sx={settingsStyles.formLabel}
      >
        {label}
      </Typography>
      
      {/* Form control without floating label */}
      <FormControl 
        size="small" 
        fullWidth 
        {...props}
      >
        {React.cloneElement(children, {
          labelId: labelId,
          id: children.props.id || labelId,
          label: null, // Remove floating label
        })}
      </FormControl>
    </Box>
  );
}

/**
 * Section header with optional tooltip
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Header text
 * @param {string} [props.tooltipTitle] - Tooltip text for the help icon
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingHeader({ label, tooltipTitle, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');

  return (
    <Box 
      sx={{ 
        ...settingsStyles.headerRow,
        ...props.sx
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {tooltipTitle && (
        <Tooltip title={tooltipTitle}>
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpCircle size={16} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

/**
 * Row layout for setting with a toggle switch and optional help tooltip
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the setting
 * @param {React.ReactNode} props.control - Control element (switch, checkbox, etc.)
 * @param {string} [props.tooltipTitle] - Tooltip text for the help icon
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingRow({ label, control, tooltipTitle, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');

  return (
    <Box sx={{ 
      ...settingsStyles.row,
      ...props.sx
    }}>
      <FormControlLabel 
        control={control}
        label={label}
        sx={settingsStyles.formControlLabel}
      />
      {tooltipTitle && (
        <Tooltip title={tooltipTitle}>
          <IconButton size="small" sx={settingsStyles.tooltipIcon}>
            <HelpCircle size={16} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

/**
 * Group of checkboxes or radio options with a header
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Group label
 * @param {string} [props.tooltipTitle] - Tooltip text for the help icon
 * @param {React.ReactNode} props.children - Checkbox elements
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingCheckboxGroup({ label, tooltipTitle, children, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');

  return (
    <Box sx={{ 
      ...settingsStyles.checkboxGroupContainer,
      ...props.sx 
    }}>
      <SettingHeader label={label} tooltipTitle={tooltipTitle} />
      
      <Box sx={settingsStyles.checkboxGroup}>
        {children}
      </Box>
    </Box>
  );
}

/**
 * Divider with consistent spacing
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingDivider(props) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');

  return (
    <Divider 
      sx={{ 
        ...settingsStyles.divider,
        ...props.sx
      }} 
    />
  );
}

/**
 * Helper text component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Helper text content
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingHelperText({ children, ...props }) {
  // Get settings styles from our styling system
  const settingsStyles = useComponentStyles('settings');

  return (
    <Typography 
      variant="caption" 
      sx={{
        ...settingsStyles.helperText,
        ...props.sx
      }}
    >
      {children}
    </Typography>
  );
}

/**
 * Reusable row that aligns a left element and a fixed-width right element
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.left - Content to render on the left side
 * @param {React.ReactNode} props.right - Content to render on the right side
 * @param {number} [props.fixedWidth=68] - Width of the right side container
 * @param {Object} [props.sx] - Additional styles to apply
 * @returns {JSX.Element} The rendered component
 */
export function SettingAlignedRow({ left, right, fixedWidth = 68, sx, ...props }) {
  const styles = {
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...(sx || {})
    },
    leftContent: {
      flexGrow: 1
    },
    rightContent: {
      width: fixedWidth,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }
  };

  return (
    <Box
      sx={styles.row}
      {...props}
    >
      <Box sx={styles.leftContent}>
        {left}
      </Box>
      <Box sx={styles.rightContent}>
        {right}
      </Box>
    </Box>
  );
}

// PropTypes definitions for all components

SettingsContainer.propTypes = {
  /** Content to render inside the container */
  children: PropTypes.node.isRequired,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingFormControl.propTypes = {
  /** Label for the form control */
  label: PropTypes.string.isRequired,
  /** Form input element */
  children: PropTypes.node.isRequired,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingHeader.propTypes = {
  /** Header text */
  label: PropTypes.string.isRequired,
  /** Tooltip text for the help icon */
  tooltipTitle: PropTypes.string,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingRow.propTypes = {
  /** Label for the setting */
  label: PropTypes.string.isRequired,
  /** Control element (switch, checkbox, etc.) */
  control: PropTypes.node.isRequired,
  /** Tooltip text for the help icon */
  tooltipTitle: PropTypes.string,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingCheckboxGroup.propTypes = {
  /** Group label */
  label: PropTypes.string.isRequired,
  /** Tooltip text for the help icon */
  tooltipTitle: PropTypes.string,
  /** Checkbox elements */
  children: PropTypes.node.isRequired,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingDivider.propTypes = {
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingHelperText.propTypes = {
  /** Helper text content */
  children: PropTypes.node.isRequired,
  /** Additional styles to apply */
  sx: PropTypes.object
};

SettingAlignedRow.propTypes = {
  /** Content to render on the left side */
  left: PropTypes.node.isRequired,
  /** Content to render on the right side */
  right: PropTypes.node.isRequired,
  /** Width of the right side container */
  fixedWidth: PropTypes.number,
  /** Additional styles to apply */
  sx: PropTypes.object,
};