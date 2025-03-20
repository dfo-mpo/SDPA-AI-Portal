
// TODO: Fix the Border Radius issue in the Card component and the color. This occured when
// we migrated ToolcontentWrapper.js and ToolPage.js to the new styling.
/**
 * Tool Content Wrapper Component
 * 
 * A wrapper component that provides consistent card styling, spacing,
 * and borders for the main content area of each tool. This component
 * ensures visual consistency across all tool interfaces.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

/**
 * Wrapper for tool content areas
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to wrap
 * @param {Object} [props.sx] - Additional styles to apply to the Card component
 * @returns {JSX.Element} The wrapped content
 */
export default function NewToolContentWrapper({ children, sx }) {
  // Get styles from our styling system
  const containerStyles = useComponentStyles('container');
  
  return (
    <Card 
      variant="outlined" 
      sx={{
        ...containerStyles.card,
        ...(sx || {}) // Merge with any custom styles
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

NewToolContentWrapper.propTypes = {
  /** The content to wrap */
  children: PropTypes.node.isRequired,
  
  /** Additional styles to apply to the Card component */
  sx: PropTypes.object
};