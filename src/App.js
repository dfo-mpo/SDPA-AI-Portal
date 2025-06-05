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
  AuthenticatedTemplate, 
  UnauthenticatedTemplate, 
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
  const isDemoMode = process.env.REACT_APP_MODE === 'demo';

  const { handleLogout: termsLogout } = useTerms();
  const { language } = useLanguage();
  const appTranslations = getLayoutTranslations('app', language);
  const { instance, accounts } = useMsal();
  const [previousAccount, setPreviousAccount] = useState(null);
  
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
   * Runs once on mount to report demo mode status.
   * 
   * Note:
   * - Authentication rendering is fully handled by `AuthenticatedTemplate` and `UnauthenticatedTemplate`.
   * - This effect is retained to log demo mode activation for debugging or analytics.
   */
  useEffect(() => {
    if (isDemoMode) {
      console.log("Running in demonstration mode.");
    }
  }, [isDemoMode]);

  /**
   * Watches MSAL `accounts` state to detect login/logout transitions.
   * 
   * On login:
   * - Sets `dfo-auth-status` in localStorage
   * 
   * On logout:
   * - Removes `dfo-auth-status` from localStorage
   * - Clears app-level term acceptance state
   * 
   * This hook ensures that side effects run *after* MSAL has completed its own session update,
   * and avoids flicker or premature UI changes before session is valid.
   */

  /**
   * Watches MSAL `accounts` array to detect login/logout transitions.
   *
   * When `accounts` becomes non-empty and no prior account was recorded:
   * - Calls `onMsalLoginSuccess()` for post-login effects.
   *
   * When `accounts` becomes empty after a user had been logged in:
   * - Calls `onMsalLogoutSuccess()` for post-logout cleanup.
   *
   * This approach cleanly decouples authentication state monitoring from UI rendering.
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
  }, [accounts]);

  // Handle login
  const handleLogin = () => {
    console.log('logging in...')
  };

  // Handle logout
  const handleLogout = () => {
    // Logout MSAL
    if (previousAccount) {
      instance.logoutRedirect({ account: previousAccount });
      console.log('logging out...');
    } else {
      console.warn('No active account found to log out.');
    }
  };

  /**
   * Handles post-login side effects after successful MSAL authentication.
   * 
   * Responsibilities:
   * - Store authentication flag in localStorage for compatibility with other logic.
   */
  const onMsalLoginSuccess = () => {
    if (!isDemoMode) {
      localStorage.setItem('dfo-auth-status', 'authenticated');
    }
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

  // Dashboard view when authenticated or in demo mode
  const dashboardContent = (
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
        <Dashboard onLogout={handleLogout} isDemoMode={isDemoMode} />
        {/* Terms Modal for authenticated users - pass isAuth=true */}
        <TermsModalContainer variant="full" isAuth={true} />
      </Box>
    </>
  );

  // Login page view for unauthenticated users
  const loginPageContent = (
    <>
      <SignIn onLogin={handleLogin} />
      {/* Terms Modal for login screen - pass isAuth=false (default) */}
      <TermsModalContainer variant="full" />
    </>
  );

  // Skip MSAL logic entirely in demo mode
  if (isDemoMode) {
    return dashboardContent;
  }

  return (
    <>
      {/* Authenticated: Show Dashboard */}
      <AuthenticatedTemplate>{dashboardContent}</AuthenticatedTemplate>
      {/* Not authenticated: Show Sign In */}
      <UnauthenticatedTemplate>{loginPageContent}</UnauthenticatedTemplate>
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