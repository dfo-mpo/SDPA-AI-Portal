
/**
 * Tool Content Wrapper Component
 * 
 * A wrapper component that provides consistent card styling, spacing,
 * and borders for the main content area of each tool. This component
 * ensures visual consistency across all tool interfaces.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, useTheme } from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { dfoColors } from '../../styles/themePrimitives'; // Import DFO colors

/**
 * Wrapper for tool content areas
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to wrap
 * @param {Object} [props.sx] - Additional styles to apply to the Card component
 * @returns {JSX.Element} The wrapped content
 */
export default function ToolContentWrapper({ children, sx }) {
  // Get styles from our styling system
  const containerStyles = useComponentStyles('container');
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{
        ...containerStyles.card,
        minWidth: 0, // Allow card to shrink below its content size
        width: '100%', // Full width
        overflowX: 'auto', // Allow horizontal scroll if needed
        borderRadius: 2, // Maintain consistent border radius
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(13, 25, 43, 0.7)' : dfoColors.white, // Use DFO white
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : dfoColors.lightGray, // Use DFO light gray
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        ...(sx || {}) // Merge with any custom styles
      }}
    >
      <CardContent 
        sx={{ 
          p: { xs: 2.5, sm: 3.5 }, // Slightly more padding
          '&:last-child': { pb: { xs: 2.5, sm: 3.5 } },
          overflowWrap: 'break-word' // Break words to prevent overflow
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

ToolContentWrapper.propTypes = {
  /** The content to wrap */
  children: PropTypes.node.isRequired,
  
  /** Additional styles to apply to the Card component */
  sx: PropTypes.object
};