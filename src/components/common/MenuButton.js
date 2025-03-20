/**
 * Menu Button Component
 * 
 * A button component for menu icons that can optionally display a notification badge.
 * Used primarily in navigation areas and toolbars.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';


/**
 * Menu button component with optional notification badge
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.showBadge=false] - Whether to show the notification badge
 * @param {React.ReactNode} props.children - Icon element to render inside the button
 * @param {function} [props.onClick] - Click handler function
 * @returns {JSX.Element} The rendered component
 */
function MenuButton({ showBadge = false, children, ...props }) {
//   const theme = useTheme();
//   const styles = getStyles(theme);
const styles = useComponentStyles('menuButton');


  return (
    <Badge 
      color="error"
      variant="dot"
      invisible={!showBadge}
      sx={styles.badge}
    >
      <IconButton size="small" {...props}>
        {children}
      </IconButton>
    </Badge>
  );
}

MenuButton.propTypes = {
  /** Whether to show the notification badge */
  showBadge: PropTypes.bool,
  
  /** Icon element to render inside the button */
  children: PropTypes.node.isRequired,
  
  /** Click handler function */
  onClick: PropTypes.func,
};

export default MenuButton;