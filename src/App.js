import React, { useState, useEffect } from 'react';
import AppTheme from './styles/AppTheme';
import { SignIn } from './components/auth';
import { LanguageProvider, ToolSettingsProvider, TermsProvider } from './contexts';
import { TermsModalContainer } from './components/common';
import { CssBaseline, Box } from '@mui/material';
import { Dashboard } from './layouts';
import { useTerms, useLanguage } from './contexts';
import { getLayoutTranslations } from './translations/layout'


/**
 * Main Application Component that handles authentication state
 */
function AppContent() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { handleLogout: termsLogout } = useTerms();
  const { language } = useLanguage();
  const appTranslations = getLayoutTranslations('app', language)
  
  // Set HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]); 
  
  // Set document title
  useEffect(() => {
    document.title = appTranslations.title;
  }, [language, appTranslations]);
  
  // Check for existing auth on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('dfo-auth-status');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle successful login
  const handleLogin = () => {
    localStorage.setItem('dfo-auth-status', 'authenticated');
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('dfo-auth-status');
    setIsAuthenticated(false);
    // Also reset the terms state
    termsLogout();
  };

  return (
    <>
      {isAuthenticated ? (
        // Authenticated: Show Dashboard
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            bgcolor: 'background.default',
          }}
        >
          <Dashboard onLogout={handleLogout} />
          {/* Terms Modal for authenticated users - pass isAuth=true */}
          <TermsModalContainer variant="full" isAuth={true} />
        </Box>
      ) : (
        // Not authenticated: Show Sign In
        <>
          <SignIn onLogin={handleLogin} />
          {/* Terms Modal for login screen - pass isAuth=false (default) */}
          <TermsModalContainer variant="full" />
        </>
      )}
    </>
  );
}

/**
 * Main Application Component with all providers
 */
function App() {
  return (
    <LanguageProvider>
      <ToolSettingsProvider>
        <TermsProvider>
          <AppTheme>
            <CssBaseline />
            <AppContent />
          </AppTheme>
        </TermsProvider>
      </ToolSettingsProvider>
    </LanguageProvider>
  );
}

export default App;