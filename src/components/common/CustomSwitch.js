/**
 * Custom Switch Component
 * 
 * An enhanced version of MUI's Switch component with better visibility and styling.
 * Provides customized sizing options for use in various UI contexts.
 */

import React from 'react';
import { Switch, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

/**
 * CustomSwitch component with enhanced styling
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size variant ('small' or 'medium')
 * @param {Object} [props.sx] - Additional styles using MUI's sx prop
 * @returns {JSX.Element} The rendered component
 */
function CustomSwitch(props) {
  const { size, sx, ...otherProps } = props;
  const theme = useTheme();
  
  // Determine if small size is requested
  const isSmall = size === 'small';
  
  // Get the styles based on size
  const styles = useComponentStyles('customSwitch', { isSmall });
  
  return (
    <Switch
      {...otherProps}
      sx={{
        ...styles.switchBase,
        ...(sx || {}) // Merge with any custom styles passed via sx prop
      }}
    />
  );
}

CustomSwitch.propTypes = {
  /** Additional styles to apply to the component */
  sx: PropTypes.object,
  /** Size variant of the switch */
  size: PropTypes.oneOf(['small', 'medium'])
};

CustomSwitch.defaultProps = {
  size: 'medium'
};

export default CustomSwitch;