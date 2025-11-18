/**
 * Detection of Ghost Gear OCDS Tool
 * 
 * Embedded link to OCDS portal tool
 */

import React from 'react';
import { Box } from '@mui/material';

export function DetectionofGhostGear() {

  return (
    <Box 
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Box
        component='iframe'
        src='https://ocds-ai-portal.canadacentral.cloudapp.azure.com/ocds-gg/'
        sx={{
          position: 'absolute',
          top: '-120px',
          left: 0,
          width: '100%',
          height: 'calc(100vh + 120px)',
        }}
      />
    </Box>
        // <iframe src="https://ocds-ai-portal.canadacentral.cloudapp.azure.com/ocds-gg/" sandbox="allow-scripts allow-same-origin" width="100%" frameborder="0" style={{marginTop: '-120px', height: '100vh'}}></iframe>  
  );
}

export default DetectionofGhostGear;