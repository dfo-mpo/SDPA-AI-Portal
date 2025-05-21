// src/contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  // Detect initial language
  const detectInitialLanguage = () => {
    // 1. Check for language in URL (e.g., /fr/ or ?lang=fr)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (langParam === 'fr' || langParam === 'en') {
      return langParam;
    }
    
    // Check for /fr/ in the path
    if (window.location.pathname.includes('/fr/')) {
      return 'fr';
    }
    
    // 2. Check for language in localStorage (for returning users)
    const storedLang = localStorage.getItem('dfo-language');
    if (storedLang === 'fr' || storedLang === 'en') {
      return storedLang;
    }
    
    // 3. Check browser language preferences
    const browserLang = navigator.language || navigator.userLanguage;
    // If the browser language starts with 'fr', set to French
    if (browserLang && browserLang.toLowerCase().startsWith('fr')) {
      return 'fr';
    }
    
    // Default to English
    return 'en';
  };

  const [language, setLanguage] = useState(detectInitialLanguage());

  // Watch for URL changes to detect language changes
  useEffect(() => {
    const handleUrlChange = () => {
      const detectedLang = detectInitialLanguage();
      setLanguage(detectedLang);
    };

    // This will not catch all URL changes, but it's a start
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  /**
   * Toggle between available languages
   */
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
    // Store the user's choice
    localStorage.setItem('dfo-language', newLang);
  };

  /**
   * Set language explicitly
   */
  const setApplicationLanguage = (lang) => {
    if (lang === 'en' || lang === 'fr') {
      setLanguage(lang);
      localStorage.setItem('dfo-language', lang);
    }
  };

  // Context value containing current language and toggle function
  const contextValue = { 
    language, 
    toggleLanguage,
    setLanguage: setApplicationLanguage
  };

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