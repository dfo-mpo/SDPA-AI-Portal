/**
 * Component Translations Index
 * 
 * This file exports all component-specific translation modules.
 */

// Import all component translations
import * as terms from './terms';
import * as footer from './footer';
import * as banner from './banner';
import * as aiToolsDropdown from './aiToolsDropdown';

// Export individual component translations
export {
    terms,
    footer,
    banner,
    aiToolsDropdown
};

/**
 * Get translations for a specific component
 * 
 * @param {string} component - Component name
 * @param {string} language - Language code ('en' or 'fr')
 * @returns {Object} - Translations for the component
 */
export function getComponentTranslations(component, language = 'en') {
  // Map component names to their translation modules
  const componentMap = {
    'terms': terms,
    'footer': footer,
    'banner': banner,
    'aiToolsDropdown': aiToolsDropdown
  };
  
  // Get the component translations
  const componentTranslations = componentMap[component];
  
  // Return the translations for the specified language
  if (componentTranslations) {
    return componentTranslations[language] || componentTranslations.en;
  }
  
  // Return empty object if component not found
  console.warn(`Translations for component "${component}" not found`);
  return {};
}