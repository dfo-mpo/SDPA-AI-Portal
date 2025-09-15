/**
 * Tool Translations Index
 * 
 * This file exports all tool-specific translation modules.
 */

// Import all tool translations
import * as scaleAgeing from './scaleAgeing';
import * as fenceCounting from './fenceCounting';
import * as csvAnalyzer from './csvAnalyzer';
import * as pdfChatbot from './pdfChatbot';
import * as piiRedactor from './piiRedactor';
import * as sensitivityScore from './sensitivityScore';
import * as frenchTranslation from './frenchTranslation';
import * as mlModelsRepo from './mlModelsRepo'

// Export individual tool translations
export {
  scaleAgeing,
  fenceCounting, 
  csvAnalyzer,
  pdfChatbot,
  piiRedactor,
  sensitivityScore,
  frenchTranslation,
  mlModelsRepo
};

/**
 * Get translations for a specific tool
 * 
 * @param {string} toolName - Tool name
 * @param {string} language - Language code ('en' or 'fr')
 * @returns {Object} - Translations for the tool
 */
export function getToolTranslations(toolName, language = 'en') {
  // Map tool names to their translation modules
  const toolMap = {
    'scaleAgeing': scaleAgeing,
    'fenceCounting': fenceCounting,
    'csvAnalyzer': csvAnalyzer,
    'pdfChatbot': pdfChatbot,
    'piiRedactor': piiRedactor,
    'sensitivityScore': sensitivityScore,
    'frenchTranslation': frenchTranslation,
    'mlModelsRepo' : mlModelsRepo
  };
  
  // Get the tool translations
  const toolTranslations = toolMap[toolName];
  
  // Return the translations for the specified language
  if (toolTranslations) {
    return toolTranslations[language] || toolTranslations.en;
  }
  
  // Return empty object if tool not found
  console.warn(`Translations for tool "${toolName}" not found`);
  return {};
}