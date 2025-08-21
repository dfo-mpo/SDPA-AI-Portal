/**
 * Fish Population Estimation OCDS Tool
 * 
 * Embedded link to OCDS portal tool
 */

import React from 'react';

export function FishPopulationEstimation() {

  return (
        <iframe src="https://ocds-ai-portal.canadacentral.cloudapp.azure.com/ocds-fpe/" sandbox="allow-scripts allow-same-origin" width="100%" frameborder="0" style={{marginTop: '-120px', height: '100vh'}}></iframe>  
  );
}

export default FishPopulationEstimation;