/**
 * Footer Component Translations
 */

export const en = {
    copyright: "© 2025 Fisheries and Oceans Canada",
    terms: "Terms of Use",
    lastUpdated: "Last Updated: {date}"
  };
  
  export const fr = {
    copyright: "© 2025 Pêches et Océans Canada",
    terms: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour : {date}"
  };
  
  /**
   * Get footer translations with date formatting
   * 
   * @param {string} language - Language code ('en' or 'fr')
   * @param {string} [date] - Optional date string to insert
   * @returns {Object} - Translations object with formatted date
   */
  export function getFooterTranslations(language, date) {
    const translations = language === 'fr' ? fr : en;
    
    // If date is provided, format the lastUpdated string
    if (date) {
      return {
        ...translations,
        lastUpdated: translations.lastUpdated.replace('{date}', date)
      };
    }
    
    return translations;
  }