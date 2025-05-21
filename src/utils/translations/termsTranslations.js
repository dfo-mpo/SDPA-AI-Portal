import { getTermsTranslations as getTranslations } from '../../translations/components/terms';

/**
 * Helper function to get terms translations
 *
 * @param {string} language - Language code ('en' or 'fr')
 * @returns {Object} - Translations object for the specified language
 */
export function getTermsTranslations(language) {
  return getTranslations(language);
}