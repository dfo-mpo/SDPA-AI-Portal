/**
 * Banner Component Translations
 */

export const en = {
    variants: {
      default: "Default",
      hero: "Hero",
      tool: "Tool"
    }
  };
  
  export const fr = {
    variants: {
      default: "Par défaut",
      hero: "Héro",
      tool: "Outil"
    }
  };
  
  /**
   * Get banner translations
   * 
   * @param {string} language - Language code ('en' or 'fr')
   * @returns {Object} - Translations object
   */
  export function getBannerTranslations(language) {
    return language === 'fr' ? fr : en;
  }