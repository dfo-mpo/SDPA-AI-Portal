import React from 'react';
import { Card, CardContent, useTheme } from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export default function ToolContentWrapper({ children, sx }) {
  const styles = useComponentStyles('toolContentWrapper');

  return (
    <Card 
      variant="outlined" 
      sx={{
        ...styles.card,
        ...(sx || {})
      }}
    >
      <CardContent sx={styles.content}>
        {children}
      </CardContent>
    </Card>
  );
}