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
* Adapts Scale Ageing settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptScaleAgeingSettings = (settings) => {
return {
  enhance: settings.enhance || false,
  fish_type: settings.fishType || 'chum'
};
};

/**
* Adapts Sensitivity Score settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptSensitivityScoreSettings = (settings) => {
// Currently, backend doesn't support customizing weights via API
// This is a placeholder for future extension
return {};
};

/**
* Adapts PII Redactor settings for the backend API
* 
* @param {Object} settings - Full settings object from the ToolSettingsContext
* @returns {Object} Settings object with only backend-supported properties
*/
export const adaptPIIRedactorSettings = (settings) => {
// The current backend implementation doesn't accept any settings parameters
// This is prepared for future extensions when the backend supports customization
return {
  // Currently, these settings are not used by the backend
  // but we structure this for future expansion
  entities: Object.keys(settings.entities || {}).filter(key => settings.entities[key])
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
};

return adapters[toolName] || adaptGenericSettings;
};