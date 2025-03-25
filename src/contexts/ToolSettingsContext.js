import React, { createContext, useContext, useState } from 'react';

const ToolSettingsContext = createContext();

/**
 * Provider component for tool settings
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The provider component
 */
export function ToolSettingsProvider({ children }) {
  
  // Scale ageing settings
  const [scaleAgeingSettings, setScaleAgeingSettings] = useState({
    fishType: 'chum', // default value
    enhance: false, // default off
  }); 

  // CSV Analyzer settings
  const [csvAnalyzerSettings, setCsvAnalyzerSettings] = useState({
    outputType: 'json', // default to JSON output (currently supported by backend)
    aiModel: 'gpt4omini', // AI model selection (future support)
    analysisType: 'summary', // Analysis type (future support)
    showSources: true, // Whether to show document sources (future support)
    outputFormats: {
      text: false, // Text output (future support)
      csv: false, // CSV output (currently supported by backend as outputType)
      json: true // JSON output (currently supported by backend as outputType)
    }
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

  // PDF Chatbot settings with token usage
  const [pdfChatbotSettings, setPdfChatbotSettings] = useState({
    modelType: 'gpt4omini',
    contextWindow: 3,
    temperature: 0.7, // Default temperature - balanced
    followupQuestions: true,
    tokenUsage: {
      used: 0, // Always start with 0 tokens used
      total: 100000
    }
  });

// Enhanced PII Redactor settings with improved Canadian-specific information detection
const [piiRedactorSettings, setPiiRedactorSettings] = useState({
  redactionMethod: 'mask', // 'mask' or 'typePlaceholder'
  redactionColor: '#000000', // Default: black
  detectionSensitivity: 7, // Scale of 1-10, default: slightly more aggressive (7)
  
  // Enhanced categories with better user-centric grouping and Canadian-specific items
  categories: {
    PERSONAL_IDENTIFIERS: {
      enabled: true,
      description: "Names, SSNs, SINs, PRIs, passport numbers, and other personal IDs" 
    },
    CONTACT_INFO: {
      enabled: true,
      description: "Phone numbers, email addresses, physical addresses, postal codes"
    },
    FINANCIAL_INFO: {
      enabled: true,
      description: "Credit cards, bank accounts, financial numbers, SINs"
    },
    ORGANIZATIONAL_INFO: {
      enabled: true,
      description: "Company names, business identifiers, department names"
    },
    LOCATION_DATA: {
      enabled: true,
      description: "Geographic locations, building names, addresses, postal codes"
    }
  },
  
  // Map old entity format for backward compatibility
  entities: {
    PERSON: true,
    EMAIL_ADDRESS: true,
    PHONE_NUMBER: true,
    ADDRESS: true,
    SIN: true,
    CREDIT_CARD: true,
    CA_POSTAL_CODE: true,
    CA_PRI: true
  }
});

  /**
   * Toggle advanced settings visibility for sensitivity score
   */
  const toggleSensitivityAdvanced = () => {
    setSensitivityScoreSettings(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
  };

  /**
   * Update token usage for PDF Chatbot
   * 
   * @param {number} used - Number of tokens used
   * @param {number|null} total - Total token limit (or null to keep existing)
   */
  const updatePdfChatbotTokenUsage = (used, total = null) => {
    setPdfChatbotSettings(prev => ({
      ...prev,
      tokenUsage: {
        used,
        total: total || prev.tokenUsage.total
      }
    }));
  };

  /**
   * Update PDF Chatbot settings
   * 
   * @param {Object} settings - New settings object or update function
   */
  const updatePdfChatbotSettings = (settings) => {
    if (typeof settings === 'function') {
      setPdfChatbotSettings(settings);
    } else {
      setPdfChatbotSettings(prev => ({
        ...prev,
        ...settings,
        // Preserve token usage unless explicitly provided
        tokenUsage: settings.tokenUsage || prev.tokenUsage
      }));
    }
  };

  /**
   * Update PII Redactor settings with backward compatibility
   * 
   * @param {Object} settings - New settings object
   */
  const updatePiiRedactorSettings = (settings) => {
    setPiiRedactorSettings(prev => {
      const newSettings = { ...prev, ...settings };
      
      // Sync entities and categories if either one was updated
      if (settings.categories) {
        // Update old entities format based on new categories
        newSettings.entities = {
          PERSON: settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.PERSON,
          EMAIL_ADDRESS: settings.categories.CONTACT_INFO?.enabled ?? prev.entities.EMAIL_ADDRESS,
          PHONE_NUMBER: settings.categories.CONTACT_INFO?.enabled ?? prev.entities.PHONE_NUMBER,
          ADDRESS: settings.categories.CONTACT_INFO?.enabled ?? prev.entities.ADDRESS,
          SIN: settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.SIN,
          CA_PRI: settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.CA_PRI,
          CA_POSTAL_CODE: settings.categories.CONTACT_INFO?.enabled ?? prev.entities.CA_POSTAL_CODE,
          CREDIT_CARD: settings.categories.FINANCIAL_INFO?.enabled ?? prev.entities.CREDIT_CARD
        };
      } else if (settings.entities) {
        // Update new categories based on old entities format
        newSettings.categories = {
          ...prev.categories,
          PERSONAL_IDENTIFIERS: {
            ...prev.categories.PERSONAL_IDENTIFIERS,
            enabled: settings.entities.PERSON || settings.entities.SIN || settings.entities.CA_PRI
          },
          CONTACT_INFO: {
            ...prev.categories.CONTACT_INFO,
            enabled: settings.entities.EMAIL_ADDRESS || settings.entities.PHONE_NUMBER || 
                    settings.entities.ADDRESS || settings.entities.CA_POSTAL_CODE
          },
          FINANCIAL_INFO: {
            ...prev.categories.FINANCIAL_INFO,
            enabled: settings.entities.CREDIT_CARD || settings.entities.SIN
          }
        };
      }
      
      return newSettings;
    });
  };

  // Pass down getters and setters
  const value = {
    // Scale Ageing
    scaleAgeingSettings,
    setScaleAgeingSettings,
    
    // CSV Analyzer
    csvAnalyzerSettings,
    setCsvAnalyzerSettings,
    
    // Sensitivity Score
    sensitivityScoreSettings,
    setSensitivityScoreSettings,
    toggleSensitivityAdvanced,
    
    // PDF Chatbot
    pdfChatbotSettings,
    updatePdfChatbotSettings,
    updatePdfChatbotTokenUsage,

    // PII Redactor with improved handling
    piiRedactorSettings,
    setPiiRedactorSettings: updatePiiRedactorSettings
  };

  return (
    <ToolSettingsContext.Provider value={value}>
      {children}
    </ToolSettingsContext.Provider>
  );
}

/**
 * Custom hook for accessing tool settings
 * 
 * @returns {Object} The tool settings context
 */
export function useToolSettings() {
  return useContext(ToolSettingsContext);
}