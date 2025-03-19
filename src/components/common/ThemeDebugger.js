// src/components/common/ThemeDebugger.js
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export default function ThemeDebugger() {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 2, mt: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6">Theme Debugger</Typography>
      <Typography variant="body2">
        Primary color: {theme.palette.primary.main}
      </Typography>
      <Typography variant="body2">
        Secondary color: {theme.palette.secondary.main}
      </Typography>
      <Typography variant="body2">
        Background: {theme.palette.background.default}
      </Typography>
      <Typography variant="body2">
        Paper: {theme.palette.background.paper}
      </Typography>
      <Typography variant="body2">
        Mode: {theme.palette.mode}
      </Typography>
    </Box>
  );
}