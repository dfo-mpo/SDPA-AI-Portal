/**
 * Settings Adapter Utility
 * 
 * This utility prepares tool settings for API calls by:
 * 1. Taking the full settings object from context
 * 2. Returning only the properties that the current backend implementation supports
 * 
 * As the backend evolves to support more settings, this adapter can be updated
 * to include those settings without changing the components.
 */


 
/**
 * Adapts CSV Analyzer settings for the backend API
 */
export const adaptCSVAnalyzerSettings = (settings) => {
  return {
    outputType: settings.outputType || 'json',
  };
};

/**
* Adapts Fence Counting settings for the backend API
*/
export const adaptFenceCountingSettings = (settings = {}) => {
  return {
    enabled_species: settings.species ? 
      Object.entries(settings.species)
        .filter(([_, enabled]) => enabled)
        .map(([species]) => species)
        .join(',') : 
      'chum',
    direction: settings.direction || 'both',
    track_objects: settings.trackObjects !== undefined ? settings.trackObjects : true
  };
};

/**
* Adapts Scale Ageing settings for the backend API
*/
export const adaptScaleAgeingSettings = (settings) => {
  return {
    enhance: settings.enhance || false,
    species: settings.species || 'chum'
  };
};

/**
* Adapts Sensitivity Score settings for the backend API
*/
export const adaptSensitivityScoreSettings = (settings = {}) => {
  const adaptedSettings = {};

  const enabledCategories = [];
  if (settings.checkPersonalInfo) enabledCategories.push('personalInfo');
  if (settings.checkBusinessInfo) enabledCategories.push('businessInfo');
  if (settings.checkScientificData) enabledCategories.push('scientificData');
  if (settings.checkLocationData) enabledCategories.push('locationData');

  adaptedSettings.enabledCategories = enabledCategories;

  if (settings.showAdvanced && settings.weights) {
    adaptedSettings.categoryWeights = {
      personalInfo: settings.weights.personalInfo || 25,
      businessInfo: settings.weights.businessInfo || 25,
      scientificData: settings.weights.scientificData || 25,
      locationData: settings.weights.locationData || 25
    };
  } else {
    const weight = enabledCategories.length > 0 ? (100 / enabledCategories.length) : 0;
    adaptedSettings.categoryWeights = {
      personalInfo: settings.checkPersonalInfo ? weight : 0,
      businessInfo: settings.checkBusinessInfo ? weight : 0,
      scientificData: settings.checkScientificData ? weight : 0,
      locationData: settings.checkLocationData ? weight : 0
    };
  }
  adaptedSettings.autoFlag = settings.autoFlag !== undefined ? settings.autoFlag : true;
  
  return adaptedSettings;
};

/**
* Adapts PII Redactor settings for the backend API
*/
export const adaptPIIRedactorSettings = (settings) => {
  const adaptedSettings = {
    redaction_method: settings.redactionMethod || 'mask',
    detection_sensitivity: settings.detectionSensitivity || 7,
  };

  if (settings.redaction === 'mask' && settings.redactionColor) {
    const hex = settings.redactionColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    adaptedSettings.redaction_color = [r, g, b].join(',');
  }

  if (settings.categories) {
    const enabledEntities = [];
    for (const [category, info] of Object.entries(settings.categories)) {
      if (info.enabled) {
        switch (category) {
          case 'PERSONAL_IDENTIFIERS':
        enabledEntities.push('PERSON', 'US_SSN', 'GOVERNMENT_ID', 'CA_SSN', 'CA_PRI');
        break;
          case 'CONTACT_INFO':
        enabledEntities.push('PHONE_NUMBER', 'EMAIL_ADDRESS', 'ADDRESS', 'CA_POSTAL_CODE');
        break;
          case 'FINANCIAL_INFO':
        enabledEntities.push('CREDIT_CARD', 'FINANCIAL_ID', 'CA_SIN');
        break;
          case 'ORGANIZATIONAL_INFO':
        enabledEntities.push('ORGANIZATION');
        break;
          case 'LOCATION_DATA':
        enabledEntities.push('LOCATION', 'CA_POSTAL_CODE', 'CA_ADDRESS_COMPONENT');
        break;
          default:
        enabledEntities.push(category);
        break;
        }
      }
    }
    if (enabledEntities.length > 0) {
      adaptedSettings.entities_to_redact = enabledEntities.join(',');
    }
  }
  
  return adaptedSettings;
};

/**
* Adapts French Translation settings for the backend API
*/
export const adaptFrenchTranslationSettings = (settings = {}) => {
  return {
    model_type: settings.modelType || 'scientific',
    preserve_formatting: settings.preserveFormatting !== undefined ? settings.preserveFormatting : true
  };
};

/**
* Adapts PDF Chatbot settings for the backend API
*/
export const adaptPdfChatbotSettings = (settings) => {
  return {
    model: mapModelTypeToAPIValue(settings.modelType),
    tempurature: settings.temperature || 0.3,
    reasoning_effort: "high",
    token_limit: settings.tokenUsage.total - settings.tokenUsage.used,
    // User-supplied API key; null for gpt4omini which uses the shared SDPA/OCDS Azure key
    api_key: settings.apiKey || null,
  };
};

/**
* Maps the frontend model type to the backend API value
*/
function mapModelTypeToAPIValue(modelType) {
  const modelMap = {
    // Azure CAD region
    'gpt4o':    'gpt-4o',
    'gpt4omini':'gpt-4o-mini',
    'gpt35':    'gpt-3.5-turbo',
    // Azure US region
    'o3mini':   'o3-mini',
  };
  // External models (Claude, Gemini, Grok) pass through as-is —
  // backend resolves them via EXTERNAL_MODEL_MAP / ANTHROPIC_models etc.
  return modelMap[modelType] || modelType;
}


/**
* Generic settings adapter that includes all properties
*/
export const adaptGenericSettings = (settings) => {
  return { ...settings };
};

/**
* Gets the appropriate adapter function for a given tool
*/
export const getSettingsAdapter = (toolName) => {
  const adapters = {
    'csvAnalyzer': adaptCSVAnalyzerSettings,
    'scaleAgeing': adaptScaleAgeingSettings,
    'sensitivityScore': adaptSensitivityScoreSettings,
    'piiRedactor': adaptPIIRedactorSettings,
    'pdfChatbot': adaptPdfChatbotSettings,
    'frenchTranslation': adaptFrenchTranslationSettings,
    'fenceCounting': adaptFenceCountingSettings,
  };

  return adapters[toolName] || adaptGenericSettings;
};