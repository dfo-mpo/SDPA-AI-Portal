import React, { createContext, useContext, useState } from 'react';

const ToolSettingsContext = createContext();


export function ToolSettingsProvider({ children }) {
  
  // Scale ageing settings
  const [scaleAgeingSettings, setScaleAgeingSettings] = useState({
    fishType: 'chum', // default value
    enhance: false, // default off
  }); 

  // Sensitivity score settings
  const [sensitivityScoreSettings, setSensitivityScoreSettings] = useState({
    checkPersonalInfo: true,
    checkBusinessInfo: true,
    checkScientificData: true,
    checkLocationData: true,
    autoFlag: true,
    showAdvanced: false,
    weights: {
      personalInfo: 25,
      businessInfo: 25,
      scientificData: 25,
      locationData: 25
    }
  });

  // Toggle advanced settings visibility
  const toggleSensitivityAdvanced = () => {
    setSensitivityScoreSettings(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
  };

  // TODO: keep other tool settings here:
  // const [fenceCountingSettings, setFenceCountingSettings] = useState({...});
  // etc.

  // Pass down getters and setters for scaleAgeing
  const value = {
    scaleAgeingSettings,
    setScaleAgeingSettings,
    sensitivityScoreSettings,
    setSensitivityScoreSettings,
    toggleSensitivityAdvanced
  };

  return (
    <ToolSettingsContext.Provider value={value}>
      {children}
    </ToolSettingsContext.Provider>
  );
}

/**
 * Custom hook so components can read this context easily
 */
export function useToolSettings() {
  return useContext(ToolSettingsContext);
}
