/**
 * Electronic Monitoring OCDS Tool
 * 
 * Embedded link to OCDS portal tool
 */

import React from 'react';

export function ElectronicMonitoring() {

  return (
        <iframe src="https://ocds-ai-portal.canadacentral.cloudapp.azure.com/ocds-em/" sandbox="allow-scripts allow-same-origin" width="100%" frameborder="0" style={{marginTop: '-120px', height: '100vh'}}></iframe>  

  );
}

export default ElectronicMonitoring;