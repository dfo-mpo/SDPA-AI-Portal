import React, { useState, useEffect } from 'react';
import AppTheme from './styles/AppTheme';
import { SignIn } from './components/auth';
import { LanguageProvider, ToolSettingsProvider } from './contexts';
import { CssBaseline, Box } from '@mui/material';
import { Dashboard } from './layouts';

/**
 * Main Application Component
 * Manages authentication state and wraps the application in the custom theme
 */
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for existing auth on mount (e.g., from localStorage)
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
  };

  return (
    <LanguageProvider>
      <ToolSettingsProvider>
        {/* ToolSettingsProvider is used to manage tool settings */}
      <AppTheme>
        <CssBaseline />
        {isAuthenticated ? (
          // Authenticated: Show Dashboard
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            }}
          >
            <Dashboard onLogout={handleLogout} />
          </Box>
        ) : (
          // Not authenticated: Show Sign In
          <SignIn onLogin={handleLogin} />
        )}
      </AppTheme>
      </ToolSettingsProvider>
    </LanguageProvider>
  );
}

export default App;