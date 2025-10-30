/**
 * Main theme provider for the application.
 * Configures and applies the Material UI theme with DFO-specific
 * colors, typography, and component customizations.
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { inputsCustomizations } from './components/inputs';
import { dataDisplayCustomizations } from './components/dataDisplay';
import { feedbackCustomizations } from './components/feedback';
import { navigationCustomizations } from './components/navigation';
import { surfacesCustomizations } from './components/surfaces';
import { colorSchemes, typography, shadows, shape, dfoColors } from './themePrimitives';

/**
 * Application theme provider that creates and applies the MUI theme
 * with all DFO-specific customizations.
 */
function AppTheme(props) {
  const { children, disableCustomTheme, themeComponents } = props;
  
  // Create theme with all customizations
  const theme = React.useMemo(() => {
    if (disableCustomTheme) return {};
    
    return createTheme({
      // Base palette configuration
      palette: {
        primary: {
          main: dfoColors.darkBlue,
          light: dfoColors.white,
          dark: dfoColors.darkBlue,
          contrastText: dfoColors.white,
        },
        secondary: {
          main: dfoColors.orange,
          light: '#FF6B1A',
          dark: '#B33F01',
          contrastText: dfoColors.white,
        },
        background: {
          default: mode => mode === 'dark' ? '#121212' : dfoColors.white,
          paper: mode => mode === 'dark' ? '#1E1E1E' : dfoColors.lightGray,
        },
        text: {
          // primary: mode => mode === 'dark' ? dfoColors.white : dfoColors.darkBlue,
          // secondary: mode => mode === 'dark' ? dfoColors.lightGray : dfoColors.darkGray,
          primary: 'hsl(220, 35%, 3%)',
          secondary: dfoColors.darkGray,
        },
      },
      
      // Color scheme configuration for light/dark mode
      cssVariables: {
        colorSchemeSelector: 'data-mui-color-scheme',
        cssVarPrefix: 'template',
      },
      colorSchemes,
      
      // Base theme properties
      typography,
      shadows,
      shape,
      
      // Component-specific customizations
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
      },
    });
  }, [disableCustomTheme, themeComponents]);
  
  // Skip theme application if disabled
  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

AppTheme.propTypes = {
  /** Child components to be rendered within the theme */
  children: PropTypes.node,
  
  /** Option to disable custom theming (for docs site) */
  disableCustomTheme: PropTypes.bool,
  
  /** Additional component customizations to merge with defaults */
  themeComponents: PropTypes.object,
};

export default AppTheme;