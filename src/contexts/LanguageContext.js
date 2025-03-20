/**
 * Language Context
 * 
 * Provides language state and toggle functionality throughout the application.
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create the context
const LanguageContext = createContext();

/**
 * Custom hook for accessing the language context
 * 
 * @returns {Object} The language context
 */
export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Provider component for language context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The provider component
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  /**
   * Toggle between available languages
   */
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'fr' : 'en'));
  };

  // Context value containing current language and toggle function
  const contextValue = { language, toggleLanguage };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

LanguageProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired
};