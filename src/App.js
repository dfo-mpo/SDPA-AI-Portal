import React, { useState, useEffect } from 'react';
import AppTheme from './styles/AppTheme';
import { SignIn, msalInstance } from './components/auth';
import { LanguageProvider, ToolSettingsProvider, TermsProvider } from './contexts';
import { TermsModalContainer } from './components/common';
import { CssBaseline, Box } from '@mui/material';
import { Dashboard } from './layouts';
import { useTerms, useLanguage } from './contexts';
import { getLayoutTranslations } from './translations/layout'
import { initGA, trackPageview } from './utils/analytics';
import { 
  MsalProvider, 
  useIsAuthenticated, 
  useMsal, 
} from '@azure/msal-react';

/**
 * Main Application Component that handles authentication.
 *
 * Responsibilities:
 * - Initializes global app settings (language, analytics, title).
 * - Renders `Dashboard` for authenticated users and `SignIn` for unauthenticated ones.
 * - Bypasses authentication entirely in demo mode.
 * - Updates `dfo-auth-status` in localStorage for external login tracking.
 */
function AppContent() {
  // Determine if the application is running in demonstration mode.
  // In demo mode, authentication is bypassed entirely.
  const isAuthenticated = useIsAuthenticated();
  const { handleLogout: termsLogout, declineTerms } = useTerms();
  const { language } = useLanguage();
  const appTranslations = getLayoutTranslations('app', language);
  const { instance, accounts } = useMsal();
  const [previousAccount, setPreviousAccount] = useState(null);
  const [loggingIn, setLogginIn] = useState(false);
  const user = accounts[0] ?? null;
  
  // Initialize Google Analytics once on mount
  useEffect(() => {
    initGA();
    trackPageview(window.location.pathname + window.location.search);
  }, []);
  
  // Set HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]); 
  
  // Set document title
  useEffect(() => {
    document.title = appTranslations.title;
  }, [language, appTranslations]);

  /**
   * Watches MSAL `accounts` array to detect login/logout transitions.
   *
   * When `accounts` becomes non-empty and no prior account was recorded:
   * - Calls `onMsalLoginSuccess()` for post-login effects.
   *
   * When `accounts` becomes empty after a user had been logged in:
   * - Calls `onMsalLogoutSuccess()` for post-logout cleanup.
   */
  useEffect(() => {
    if (accounts.length > 0 && !previousAccount) {
      onMsalLoginSuccess();
      setPreviousAccount(accounts[0]);
    }

    if (accounts.length === 0 && previousAccount) {
      onMsalLogoutSuccess();
      setPreviousAccount(null);
    }
  }, [accounts, previousAccount]);

  /**
   * Handle Microsoft Entra ID login.
   *
   * - Called from `SignIn.js` once terms are accepted.
   * - Triggers MSAL login, which navigates the user to the Entra ID login portal.
   */
  const handleLogin = async () => {
    console.log('logging in...')
    try {
      await instance.loginRedirect();
      console.log('Redirecting to Entra ID...');
    } catch (err) {
      console.error("MSAL login failed:", err);
      declineTerms();
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('logging out...');
    // Logout MSAL
    if (previousAccount) {
      instance.logoutRedirect({ account: previousAccount });
    } else {
      console.warn('No active account found to log out.');
    }
  };

  // Switch to login page view for unauthenticated users
  const loginPageContent = () =>
    setLogginIn(true);
  ;

  /**
   * Handles post-login side effects after successful MSAL authentication.
   * 
   * Responsibilities:
   * - Store authentication flag in localStorage for compatibility with other logic.
   */
  const onMsalLoginSuccess = () => {
    localStorage.setItem('dfo-auth-status', 'authenticated');
    console.log('MSAL login complete');
  };

  /**
   * Handles post-logout cleanup after MSAL session has been removed.
   * 
   * Responsibilities:
   * - Remove login flag from localStorage
   * - Reset any app-specific session state (e.g., terms acceptance)
   */
  const onMsalLogoutSuccess = () => {
    localStorage.removeItem('dfo-auth-status');
    termsLogout();
    console.log('Post logout cleanup complete');
  };

  // If user chooses not to login, view is switched back to the dashboard
  const cancelLogin = () => {
    setLogginIn(false);
  };

  // When a user logs in, reset the login page flag
  useEffect(() => {
    if(user != null) setLogginIn(false);
  }, [user]);

  return(
    !loggingIn ?
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <Dashboard onLogout={handleLogout} onLogin={loginPageContent} isAuth={isAuthenticated} />
        {/* Terms Modal for authenticated users - pass isAuth=true */}
        <TermsModalContainer variant="full" isAuth={true} />
      </Box>
    </>
    :
    <>
      <SignIn onLogin={handleLogin} cancelLogin={cancelLogin}/>
      {/* Terms Modal for login screen - pass isAuth=false (default) */}
      <TermsModalContainer variant="full" />
    </>
  )

  
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
            <MsalProvider instance={msalInstance}>
              <AppContent />
            </MsalProvider>
          </AppTheme>
        </TermsProvider>
      </ToolSettingsProvider>
    </LanguageProvider>
  );
}

export default App;