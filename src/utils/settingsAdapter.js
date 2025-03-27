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

// TODO: incorporate other toolds here as needed
 
/**
 * Adapts CSV Analyzer settings for the backend API
 * 
 * @param {Object} settings - Full settings object from the ToolSettingsContext
 * @returns {Object} Settings object with only backend-supported properties
 */
export const adaptCSVAnalyzerSettings = (settings) => {
  // Currently, the backend only officially supports outputType="json",
  // but we'll pass the selected format for our mock implementation
  return {
    outputType: settings.outputType || 'json',
    // Add the outputFormats for our mock to know what the user selected
    // outputFormats: settings.outputFormats || { json: true }
  };
};

/**
* Adapts Fence Counting settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptFenceCountingSettings = (settings = {}) => {
  // Currently, the backend doesn't accept any settings parameters
  // Store the settings in a normalized format so they're ready when the backend supports them
  return {
    // Convert species object to a format the backend would likely use
    enabled_species: settings.species ? 
      Object.entries(settings.species)
        .filter(([_, enabled]) => enabled)
        .map(([species]) => species)
        .join(',') : 
      'chum', // Default to chum if no species settings
      
    direction: settings.direction || 'both',
    track_objects: settings.trackObjects !== undefined ? settings.trackObjects : true
  };
};
/**
* Adapts Scale Ageing settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptScaleAgeingSettings = (settings) => {
  return {
    enhance: settings.enhance || false, // default to false
    fish_type: settings.fishType || 'chum' //default to chum
  };
};

/**
* Adapts Sensitivity Score settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptSensitivityScoreSettings = (settings = {}) => {
  /// Create backend-compatible settings object
  const adaptedSettings = {};

  // Add enabled categories
  const enabledCategories = [];
  if (settings.checkPersonalInfo) enabledCategories.push('personalInfo');
  if (settings.checkBusinessInfo) enabledCategories.push('businessInfo');
  if (settings.checkScientificData) enabledCategories.push('scientificData');
  if (settings.checkLocationData) enabledCategories.push('locationData');

  adaptedSettings.enabledCategories = enabledCategories;

  // Add category weights
  if (settings.showAdvanced && settings.weights) {
    adaptedSettings.categoryWeights = {
      personalInfo: settings.weights.personalInfo || 25,
      businessInfo: settings.weights.businessInfo || 25,
      scientificData: settings.weights.scientificData || 25,
      locationData: settings.weights.locationData || 25
    };
  } else {
    // If not in advanced mode, distribute weight evenly among enabled categories
    const weight = enabledCategories.length > 0 ? (100 / enabledCategories.length) : 0;
    
    adaptedSettings.categoryWeights = {
      personalInfo: settings.checkPersonalInfo ? weight : 0,
      businessInfo: settings.checkBusinessInfo ? weight : 0,
      scientificData: settings.checkScientificData ? weight : 0,
      locationData: settings.checkLocationData ? weight : 0
    };
  }
  // Add autoFlag setting
  adaptedSettings.autoFlag = settings.autoFlag !== undefined ? settings.autoFlag : true;
  
  return adaptedSettings;
};

/**
* Adapts PII Redactor settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptPIIRedactorSettings = (settings) => {
  const adaptedSettings = {
    redaction_method: settings.redactionMethod || 'mask',
    detection_sensitivity: settings.detectionSensitivity || 7,
  };

  // Add color conversion for mask method
  if (settings.redaction === 'mask' && settings.redactionColor) {
    // Convert hex color to RGB
    const hex = settings.redactionColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    adaptedSettings.redaction_color = [r, g, b].join(',');
  }
  // Convert categories to entities_to_redact array

  if (settings.categories) {
    const enabledEntities = [];
    // Map frontend categories to backend entities
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
        // If an unknown category is enabled, add it as-is
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
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptFrenchTranslationSettings = (settings = {}) => {
  // Currently, the backend doesn't accept any settings parameters
  // Store the settings in a normalized format so they're ready when the backend supports them
  return {
    // Frontend uses camelCase, backend will likely use snake_case
    model_type: settings.modelType || 'scientific',
    preserve_formatting: settings.preserveFormatting !== undefined ? settings.preserveFormatting : true
  };
};

/**
* Adapts PDF Chatbot settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptPdfChatbotSettings = (settings) => {
  return {
    model: mapModelTypeToAPIValue(settings.modelType),
    tempurature: settings.temperature || 0.3,
    reasoning_effort: "high"
  };
};

/**
* Maps the frontend model type to the backend API value
* 
* @param {string} modelType - The frontend model type
* @returns {string} The backend API model value
*/
function mapModelTypeToAPIValue(modelType) {
  const modelMap = {
    'gpt4o': 'gpt-4o',
    'gpt4omini': 'gpt-4o-mini',
    'gpt35': 'gpt-3.5-turbo',
    'o3mini': 'o3-mini'
  };

  return modelMap[modelType] || 'gpt-4o-mini'; // Default to gpt-4o-mini if not found
}

/**
* Generic settings adapter that includes all properties
* For tools with no specific adapter, this passes everything through
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} The same settings object
*/
  export const adaptGenericSettings = (settings) => {
  return { ...settings };
};

/**
* Gets the appropriate adapter function for a given tool
* 
* @param {string} toolName - Name of the tool
* @returns {Function} Adapter function for the specified tool
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