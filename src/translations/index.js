/**
 * Translations Index
 * 
 * This file exports all translation modules for centralized access.
 */

// Component translations
import * as terms from './components/terms';
import * as footer from './components/footer';
import * as common from './common';
import * as auth from './auth';
import * as layout from './layout';

// Tool translations
import * as toolTranslations from './tools';

// Export individual modules for direct imports
export {
    terms,
    footer,
    common,
    auth,
    layout,
    toolTranslations
};

/**
 * Get translations for a specific component
 * 
 * @param {string} component - Component name
 * @param {string} language - Language code ('en' or 'fr')
 * @returns {Object} - Translations for the component
 */
export const getTranslation = (component, language = 'en') => {
  // Default language fallback
  const lang = ['en', 'fr'].includes(language) ? language : 'en';
  
  // Component-specific translations
  switch (component) {
    case 'terms':
      return terms[lang] || terms.en;
    case 'footer':
      return footer[lang] || footer.en;
    case 'common':
      return common[lang] || common.en;
    case 'auth':
      return auth[lang] || auth.en;
    case 'layout':
      return layout[lang] || layout.en;
    default:
      // Check if it's a tool
      if (toolTranslations[component]) {
        return toolTranslations[component][lang] || toolTranslations[component].en;
      }
      
      // Return empty object if component not found
      console.warn(`Translations for component "${component}" not found`);
      return {};
  }
};