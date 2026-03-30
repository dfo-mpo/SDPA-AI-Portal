import React, { createContext, useContext, useState } from 'react';

const ToolSettingsContext = createContext();

export function ToolSettingsProvider({ children }) {

  const [fenceCountingSettings, setFenceCountingSettings] = useState({
    species: { sockeye: true, chum: true, chinook: true, coho: true, pink: true },
    direction: 'both',
    trackObjects: true
  });
  
  const [scaleAgeingSettings, setScaleAgeingSettings] = useState({
    species: 'chum',
    enhance: false,
  }); 

  const [csvAnalyzerSettings, setCsvAnalyzerSettings] = useState({
    outputType: 'json',
    aiModel: 'gpt4omini',
    analysisType: 'summary',
    showSources: true,
    outputFormats: { text: false, csv: false, json: true }
  });

  const [sensitivityScoreSettings, setSensitivityScoreSettings] = useState({
    checkPersonalInfo: true,
    checkBusinessInfo: true,
    checkScientificData: true,
    checkLocationData: true,
    autoFlag: true,
    showAdvanced: false,
    weights: { personalInfo: 25, businessInfo: 25, scientificData: 25, locationData: 25 }
  });

  const [pdfChatbotSettings, setPdfChatbotSettings] = useState({
    modelType: 'gpt4omini',
    contextWindow: 3,
    temperature: 0.7,
    followupQuestions: true,
    apiKey: '',
    showKey: false,
    tokenUsage: { used: 0, total: 100000 }
  });

  const [webScraperSettings, setWebScraperSettings] = useState({
    modelType: 'gpt4omini',
    apiKey: '',
    showKey: false,
  });

  const [PDFExtractionToolSettings, setPDFExtractionToolSettings] = useState({
    modelType: 'gpt4omini',
    apiKey: '',
    showKey: false,
  });

  // ── Replicate Me settings ─────────────────────────────────────────────────
  // Shape matches pdfChatbotSettings so it can be passed directly to askOpenAI
  const [replicateMeSettings, setReplicateMeSettings] = useState({
    modelType: 'gpt4omini',
    apiKey: '',
    showKey: false,
    temperature: 0.3,
    contextWindow: 3,
    followupQuestions: false,
    tokenUsage: { used: 0, total: 100000 },
  });

  const [piiRedactorSettings, setPiiRedactorSettings] = useState({
    redactionMethod: 'mask',
    redactionColor: '#000000',
    detectionSensitivity: 7,
    categories: {
      PERSONAL_IDENTIFIERS: { enabled: true, description: "Names, SSNs, SINs, PRIs, passport numbers, and other personal IDs" },
      CONTACT_INFO:         { enabled: true, description: "Phone numbers, email addresses, physical addresses, postal codes" },
      FINANCIAL_INFO:       { enabled: true, description: "Credit cards, bank accounts, financial numbers, SINs" },
      ORGANIZATIONAL_INFO:  { enabled: true, description: "Company names, business identifiers, department names" },
      LOCATION_DATA:        { enabled: true, description: "Geographic locations, building names, addresses, postal codes" }
    },
    entities: {
      PERSON: true, EMAIL_ADDRESS: true, PHONE_NUMBER: true, ADDRESS: true,
      SIN: true, CREDIT_CARD: true, CA_POSTAL_CODE: true, CA_PRI: true
    }
  });

  const toggleSensitivityAdvanced = () => {
    setSensitivityScoreSettings(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  };

  const updatePdfChatbotTokenUsage = (used, total = null) => {
    setPdfChatbotSettings(prev => ({
      ...prev,
      tokenUsage: { used, total: total || prev.tokenUsage.total }
    }));
  };

  const updatePdfChatbotSettings = (settings) => {
    if (typeof settings === 'function') {
      setPdfChatbotSettings(settings);
    } else {
      setPdfChatbotSettings(prev => ({
        ...prev, ...settings,
        tokenUsage: settings.tokenUsage || prev.tokenUsage
      }));
    }
  };

  const updateWebScraperSettings = (settings) => {
    if (typeof settings === 'function') {
      setWebScraperSettings(settings);
    } else {
      setWebScraperSettings(prev => ({ ...prev, ...settings }));
    }
  };

  const updatePDFExtractionToolSettings = (settings) => {
    if (typeof settings === 'function') {
      setPDFExtractionToolSettings(settings);
    } else {
      setPDFExtractionToolSettings(prev => ({ ...prev, ...settings }));
    }
  };

  /**
   * Update Replicate Me settings
   * @param {Object|Function} settings
   */
  const updateReplicateMeSettings = (settings) => {
    if (typeof settings === 'function') {
      setReplicateMeSettings(settings);
    } else {
      setReplicateMeSettings(prev => ({
        ...prev,
        ...settings,
        tokenUsage: settings.tokenUsage || prev.tokenUsage,
      }));
    }
  };

  const updatePiiRedactorSettings = (settings) => {
    setPiiRedactorSettings(prev => {
      const newSettings = { ...prev, ...settings };
      if (settings.categories) {
        newSettings.entities = {
          PERSON:        settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.PERSON,
          EMAIL_ADDRESS: settings.categories.CONTACT_INFO?.enabled         ?? prev.entities.EMAIL_ADDRESS,
          PHONE_NUMBER:  settings.categories.CONTACT_INFO?.enabled         ?? prev.entities.PHONE_NUMBER,
          ADDRESS:       settings.categories.CONTACT_INFO?.enabled         ?? prev.entities.ADDRESS,
          SIN:           settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.SIN,
          CA_PRI:        settings.categories.PERSONAL_IDENTIFIERS?.enabled ?? prev.entities.CA_PRI,
          CA_POSTAL_CODE:settings.categories.CONTACT_INFO?.enabled         ?? prev.entities.CA_POSTAL_CODE,
          CREDIT_CARD:   settings.categories.FINANCIAL_INFO?.enabled       ?? prev.entities.CREDIT_CARD
        };
      } else if (settings.entities) {
        newSettings.categories = {
          ...prev.categories,
          PERSONAL_IDENTIFIERS: { ...prev.categories.PERSONAL_IDENTIFIERS, enabled: settings.entities.PERSON || settings.entities.SIN || settings.entities.CA_PRI },
          CONTACT_INFO:         { ...prev.categories.CONTACT_INFO,         enabled: settings.entities.EMAIL_ADDRESS || settings.entities.PHONE_NUMBER || settings.entities.ADDRESS || settings.entities.CA_POSTAL_CODE },
          FINANCIAL_INFO:       { ...prev.categories.FINANCIAL_INFO,       enabled: settings.entities.CREDIT_CARD || settings.entities.SIN }
        };
      }
      return newSettings;
    });
  };

  const value = {
    scaleAgeingSettings,    setScaleAgeingSettings,
    csvAnalyzerSettings,    setCsvAnalyzerSettings,
    sensitivityScoreSettings, setSensitivityScoreSettings, toggleSensitivityAdvanced,
    pdfChatbotSettings,     updatePdfChatbotSettings,     updatePdfChatbotTokenUsage,
    piiRedactorSettings,    setPiiRedactorSettings: updatePiiRedactorSettings,
    fenceCountingSettings,  setFenceCountingSettings,
    webScraperSettings,     updateWebScraperSettings,
    PDFExtractionToolSettings, updatePDFExtractionToolSettings,
    replicateMeSettings,    updateReplicateMeSettings,
  };

  return (
    <ToolSettingsContext.Provider value={value}>
      {children}
    </ToolSettingsContext.Provider>
  );
}

export function useToolSettings() {
  return useContext(ToolSettingsContext);
}