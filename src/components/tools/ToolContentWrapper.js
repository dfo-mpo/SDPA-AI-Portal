import React from 'react';
import { Card, CardContent, useTheme } from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { dfoColors } from '../../styles/themePrimitives';

export default function ToolContentWrapper({ children, sx }) {
  const containerStyles = useComponentStyles('container');
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{
        ...containerStyles.card,
        width: '100%',
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(13, 25, 43, 0.7)' : dfoColors.white,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : dfoColors.lightGray,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        // Improved overflow handling
        overflow: 'visible',
        ...(sx || {})
      }}
    >
      <CardContent 
        sx={{ 
          p: { xs: 2.5, sm: 3.5 },
          '&:last-child': { pb: { xs: 2.5, sm: 3.5 } },
          // Improved content wrapping
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          // Enable horizontal scrolling if needed while maintaining full content visibility
          overflow: 'visible'
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}