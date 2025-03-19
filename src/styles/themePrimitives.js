// /**
//  * DFO Theme Configuration
//  * 
//  * Creates a complete Material UI theme using our design tokens.
//  * This file configures all aspects of the MUI theme including palettes,
//  * typography, component overrides, and variants.
//  */

// import { createTheme, alpha } from '@mui/material/styles';
// import {
//   dfoColors,
//   brandPalette,
//   grayPalette,
//   semanticPalettes,
//   typography as typographyTokens,
//   spacing as spacingTokens,
//   borderRadius as borderRadiusTokens,
//   shadows as shadowTokens,
// } from './tokens';

// /**
//  * Create theme modes (light and dark)
//  * Each mode has its own palette configuration
//  */
// const getDesignTokens = (mode) => ({
//   palette: {
//     mode,
//     // Primary palette - blues
//     primary: {
//       light: brandPalette[300],
//       main: dfoColors.darkBlue,
//       dark: brandPalette[700],
//       contrastText: dfoColors.white,
//       ...(mode === 'dark' && {
//         light: brandPalette[300],
//         main: brandPalette[400],
//         dark: brandPalette[700],
//         contrastText: brandPalette[50],
//       }),
//     },
//     // Secondary palette - oranges
//     secondary: {
//       light: dfoColors.orange,
//       main: dfoColors.orange,
//       dark: '#B33F01',  // Darker version of orange
//       contrastText: dfoColors.white,
//     },
//     // Info palette
//     info: {
//       light: brandPalette[100],
//       main: brandPalette[300],
//       dark: brandPalette[600],
//       contrastText: grayPalette[50],
//       ...(mode === 'dark' && {
//         contrastText: brandPalette[300],
//         light: brandPalette[500],
//         main: brandPalette[700],
//         dark: brandPalette[900],
//       }),
//     },
//     // Warning palette
//     warning: {
//       light: semanticPalettes.warning[300],
//       main: semanticPalettes.warning[400],
//       dark: semanticPalettes.warning[800],
//       ...(mode === 'dark' && {
//         light: semanticPalettes.warning[400],
//         main: semanticPalettes.warning[500],
//         dark: semanticPalettes.warning[700],
//       }),
//     },
//     // Error palette
//     error: {
//       light: semanticPalettes.error[300],
//       main: semanticPalettes.error[400],
//       dark: semanticPalettes.error[800],
//       ...(mode === 'dark' && {
//         light: semanticPalettes.error[400],
//         main: semanticPalettes.error[500],
//         dark: semanticPalettes.error[700],
//       }),
//     },
//     // Success palette
//     success: {
//       light: semanticPalettes.success[300],
//       main: semanticPalettes.success[400],
//       dark: semanticPalettes.success[800],
//       ...(mode === 'dark' && {
//         light: semanticPalettes.success[400],
//         main: semanticPalettes.success[500],
//         dark: semanticPalettes.success[700],
//       }),
//     },
//     // Grey palette
//     grey: {
//       ...grayPalette,
//     },
//     // Divider
//     divider: mode === 'dark' ? alpha(grayPalette[700], 0.6) : alpha(grayPalette[300], 0.4),
//     // Background
//     background: {
//       // Use undefined for the main background to match your original theme
//       default: undefined,
//       // Use undefined for paper background to match your original theme
//       paper: undefined,
//       // Add specific backgrounds for components you want to style
//       card: mode === 'dark' ? grayPalette[800] : grayPalette[50],
//       alert: mode === 'dark' ? alpha(semanticPalettes.warning[900], 0.3) : alpha(semanticPalettes.warning[50], 0.5),
//       sidebar: mode === 'dark' ? grayPalette[900] : grayPalette[100],
//       header: mode === 'dark' ? grayPalette[900] : '#FFFFFF',
//       // You can add more specific background colors as needed
//     },
//     // Text colors
//     text: {
//       primary: grayPalette[800],
//       secondary: grayPalette[600],
//       warning: semanticPalettes.warning[400],
//       ...(mode === 'dark' && {
//         primary: 'hsl(0, 0%, 100%)',
//         secondary: grayPalette[400],
//       }),
//     },
//     // Action colors (hover, focus, etc.)
//     action: {
//       hover: alpha(grayPalette[200], 0.2),
//       selected: `${alpha(grayPalette[200], 0.3)}`,
//       ...(mode === 'dark' && {
//         hover: alpha(grayPalette[600], 0.2),
//         selected: alpha(grayPalette[600], 0.3),
//       }),
//     },
//   }
// });

// // Create the base theme
// const baseTheme = createTheme({
//   spacing: (factor) => `${factor * spacingTokens.md / 16}rem`,  // Convert to rem
//   shape: {
//     borderRadius: borderRadiusTokens.md,
//   },
//   typography: {
//     fontFamily: typographyTokens.fontFamily.primary,
//     h1: {
//       fontSize: `${typographyTokens.fontSize.xxxxxl / 16}rem`,  // Convert to rem
//       fontWeight: typographyTokens.fontWeight.semiBold,
//       lineHeight: typographyTokens.lineHeight.tight,
//       letterSpacing: -0.5,
//     },
//     h2: {
//       fontSize: `${typographyTokens.fontSize.xxxxl / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.semiBold,
//       lineHeight: typographyTokens.lineHeight.tight,
//     },
//     h3: {
//       fontSize: `${typographyTokens.fontSize.xxxl / 16}rem`,
//       lineHeight: typographyTokens.lineHeight.tight,
//     },
//     h4: {
//       fontSize: `${typographyTokens.fontSize.xxl / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.semiBold,
//       lineHeight: typographyTokens.lineHeight.normal,
//     },
//     h5: {
//       fontSize: `${typographyTokens.fontSize.xl / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.semiBold,
//     },
//     h6: {
//       fontSize: `${typographyTokens.fontSize.lg / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.semiBold,
//     },
//     subtitle1: {
//       fontSize: `${typographyTokens.fontSize.lg / 16}rem`,
//     },
//     subtitle2: {
//       fontSize: `${typographyTokens.fontSize.sm / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.medium,
//     },
//     body1: {
//       fontSize: `${typographyTokens.fontSize.sm / 16}rem`,
//     },
//     body2: {
//       fontSize: `${typographyTokens.fontSize.sm / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.regular,
//     },
//     caption: {
//       fontSize: `${typographyTokens.fontSize.xs / 16}rem`,
//       fontWeight: typographyTokens.fontWeight.regular,
//     },
//   }
// });

// /**
//  * Create a complete theme with component overrides
//  * 
//  * @param {('light'|'dark')} mode - Theme mode (light or dark)
//  * @returns {Object} Complete Material UI theme
//  */
// export const createDfoTheme = (mode = 'light') => {
//   // Get design tokens for the selected mode
//   const designTokens = getDesignTokens(mode);
  
//   // Create and return the complete theme
//   return createTheme(baseTheme, {
//     ...designTokens,
//     // Component-specific styling overrides
//     components: {
//       // ===== SURFACES =====
      
//       // Card component styling
//       MuiCard: {
//         styleOverrides: {
//           root: ({ theme }) => ({
//             padding: theme.spacing(2),
//             gap: theme.spacing(2),
//             backgroundColor: mode === 'dark' ? grayPalette[800] : grayPalette[50],
//             borderRadius: borderRadiusTokens.md,
//             border: `1px solid ${theme.palette.divider}`,
//             boxShadow: 'none',
//             // Card variants
//             variants: [
//               {
//                 props: { variant: 'outlined' },
//                 style: {
//                   border: `1px solid ${theme.palette.divider}`,
//                   background: mode === 'dark' ? alpha(grayPalette[900], 0.4) : dfoColors.white,
//                 }
//               }
//             ]
//           })
//         }
//       },
      
//       // Card content styling
//       MuiCardContent: {
//         styleOverrides: {
//           root: {
//             padding: 0,
//             '&:last-child': { paddingBottom: 0 }
//           }
//         }
//       },
      
//       // Paper component styling
//       MuiPaper: {
//         defaultProps: {
//           elevation: 0,
//         },
//       },
      
//       // ===== INPUTS =====
      
//       // Button styling
//       MuiButton: {
//         styleOverrides: {
//           root: ({ theme }) => ({
//             boxShadow: 'none',
//             borderRadius: theme.shape.borderRadius,
//             textTransform: 'none',
//             fontWeight: typographyTokens.fontWeight.medium,
//             variants: [
//               {
//                 props: { size: 'small' },
//                 style: {
//                   height: '2.25rem',
//                   padding: '8px 12px',
//                 }
//               },
//               {
//                 props: { size: 'medium' },
//                 style: {
//                   height: '2.5rem',
//                 }
//               },
//               {
//                 props: { variant: 'outlined' },
//                 style: {
//                   color: theme.palette.text.primary,
//                   border: '1px solid',
//                   borderColor: grayPalette[200],
//                   backgroundColor: alpha(grayPalette[50], 0.3),
//                   '&:hover': {
//                     backgroundColor: grayPalette[100],
//                     borderColor: grayPalette[300],
//                   },
//                   '&:active': {
//                     backgroundColor: grayPalette[200],
//                   },
//                   ...(mode === 'dark' && {
//                     backgroundColor: grayPalette[800],
//                     borderColor: grayPalette[700],
//                     '&:hover': {
//                       backgroundColor: grayPalette[900],
//                       borderColor: grayPalette[600],
//                     },
//                     '&:active': {
//                       backgroundColor: grayPalette[900],
//                     },
//                   }),
//                 }
//               }
//             ]
//           })
//         }
//       },
      
//       // Icon button styling
//       MuiIconButton: {
//         styleOverrides: {
//           root: ({ theme }) => ({
//             boxShadow: 'none',
//             borderRadius: theme.shape.borderRadius,
//             color: theme.palette.text.primary,
//             border: '1px solid ',
//             borderColor: grayPalette[200],
//             backgroundColor: alpha(grayPalette[50], 0.3),
//             '&:hover': {
//               backgroundColor: grayPalette[100],
//               borderColor: grayPalette[300],
//             },
//             '&:active': {
//               backgroundColor: grayPalette[200],
//             },
//             ...(mode === 'dark' && {
//               backgroundColor: grayPalette[800],
//               borderColor: grayPalette[700],
//               '&:hover': {
//                 backgroundColor: grayPalette[900],
//                 borderColor: grayPalette[600],
//               },
//               '&:active': {
//                 backgroundColor: grayPalette[900],
//               },
//             }),
//           })
//         }
//       },
      
//       // ===== FEEDBACK =====
      
//       // Alert component styling
//       MuiAlert: {
//         styleOverrides: {
//           root: ({ theme }) => ({
//             borderRadius: borderRadiusTokens.lg,
//             backgroundColor: semanticPalettes.warning[100],
//             color: theme.palette.text.primary,
//             border: `1px solid ${alpha(semanticPalettes.warning[300], 0.5)}`,
//             '& .MuiAlert-icon': {
//               color: semanticPalettes.warning[500],
//             },
//             ...(mode === 'dark' && {
//               backgroundColor: `${alpha(semanticPalettes.warning[900], 0.5)}`,
//               border: `1px solid ${alpha(semanticPalettes.warning[800], 0.5)}`,
//             }),
//           })
//         }
//       },
      
//       // ===== OTHER COMPONENTS =====
      
//       // List item styling
//       MuiListItem: {
//         styleOverrides: {
//           root: {
//             borderRadius: borderRadiusTokens.sm,
//             '&:hover': {
//               backgroundColor: mode === 'dark' ? alpha(grayPalette[700], 0.2) : alpha(grayPalette[200], 0.5),
//             }
//           }
//         }
//       },
      
//       // Menu styling
//       MuiMenu: {
//         styleOverrides: {
//           paper: ({ theme }) => ({
//             marginTop: '4px',
//             borderRadius: theme.shape.borderRadius,
//             border: `1px solid ${theme.palette.divider}`,
//             background: mode === 'dark' ? grayPalette[900] : dfoColors.white,
//             boxShadow: mode === 'dark'
//               ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
//               : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
//           })
//         }
//       },
//     }
//   });
// };

// // Export theme for light mode by default
// export default createDfoTheme('light');

/**
 * DFO Portal Theme Primitives
 * 
 * This file contains the core design tokens and primitive values used throughout the application.
 * These define the foundation of the design system including:
 * - Color palettes
 * - Typography settings
 * - Spacing and sizing
 * - Shadows and shapes
 * 
 * All theme customizations should reference these primitives for consistency.
 */

import { createTheme, alpha } from '@mui/material/styles';

// Create a default theme to access default values
const defaultTheme = createTheme();

// ===== DFO Brand Colors =====
// The official DFO color palette used across the application
export const dfoColors = {
  darkBlue: '#26374A',   // Primary brand color
  orange: '#DC4D01',     // Secondary/accent color
  lightGray: '#E5E5E5',  // Light background
  darkGray: '#333333',   // Text and dark elements
  white: '#FFFFFF',      // White elements
};

// ===== Extended Color Palettes =====
// Extended color palettes for various UI needs

// Blue color palette (derived from brand primary)
export const brand = {
  50: 'hsl(210, 100%, 95%)',
  100: 'hsl(210, 100%, 92%)',
  200: 'hsl(210, 100%, 80%)',
  300: 'hsl(210, 100%, 65%)',
  400: 'hsl(210, 98%, 48%)',
  500: 'hsl(210, 98%, 42%)',
  600: 'hsl(210, 98%, 55%)',
  700: 'hsl(210, 100%, 35%)',
  800: 'hsl(210, 100%, 16%)',
  900: 'hsl(210, 100%, 21%)',
};

// Gray palette for neutral elements
export const gray = {
  50: 'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%, 6%)',
  900: 'hsl(220, 35%, 3%)',
};

// Success color palette (greens)
export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

// Warning color palette (oranges)
export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

// Error color palette (reds)
export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
};

/**
 * Generate design tokens based on light/dark mode
 * Used to create different theme variants
 */
export const getDesignTokens = (mode) => {
  // Create custom shadows - different for light/dark mode
  const customShadows = [...defaultTheme.shadows];
  customShadows[1] = mode === 'dark'
    ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
    : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

  return {
    palette: {
      mode,
      // Primary palette - blues
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: brand[50],
        ...(mode === 'dark' && {
          contrastText: brand[50],
          light: brand[300],
          main: brand[400],
          dark: brand[700],
        }),
      },
      // Info palette
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        }),
      },
      // Warning palette
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
        ...(mode === 'dark' && {
          light: orange[400],
          main: orange[500],
          dark: orange[700],
        }),
      },
      // Error palette
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
        ...(mode === 'dark' && {
          light: red[400],
          main: red[500],
          dark: red[700],
        }),
      },
      // Success palette
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === 'dark' && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      // Grey palette
      grey: {
        ...gray,
      },
      // Divider
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      // Background
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper: 'hsl(220, 35%, 97%)',
        ...(mode === 'dark' && { 
          default: gray[900], 
          paper: 'hsl(220, 30%, 7%)' 
        }),
      },
      // Text colors
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
        ...(mode === 'dark' && {
          primary: 'hsl(0, 0%, 100%)',
          secondary: gray[400],
        }),
      },
      // Action colors (hover, focus, etc.)
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
        ...(mode === 'dark' && {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        }),
      },
    },
    // Typography settings
    typography: {
      fontFamily: 'Inter, sans-serif',
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        lineHeight: 1.2,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(18),
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 400,
      },
      caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 400,
      },
    },
    // Border radius for components
    shape: {
      borderRadius: 8,
    },
    // Shadow definitions
    shadows: customShadows,
  };
};

// ===== COLOR SCHEMES =====
// Pre-defined color schemes for light and dark modes

export const colorSchemes = {
  // Light mode color scheme
  light: {
    palette: {
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: brand[50],
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper: 'hsl(220, 35%, 97%)',
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    },
  },
  // Dark mode color scheme
  dark: {
    palette: {
      primary: {
        contrastText: brand[50],
        light: brand[300],
        main: brand[400],
        dark: brand[700],
      },
      info: {
        contrastText: brand[300],
        light: brand[500],
        main: brand[700],
        dark: brand[900],
      },
      warning: {
        light: orange[400],
        main: orange[500],
        dark: orange[700],
      },
      error: {
        light: red[400],
        main: red[500],
        dark: red[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[700], 0.6),
      background: {
        default: gray[900],
        paper: 'hsl(220, 30%, 7%)',
      },
      text: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: gray[400],
      },
      action: {
        hover: alpha(gray[600], 0.2),
        selected: alpha(gray[600], 0.3),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
};

// ===== TYPOGRAPHY =====
// Typography definitions for the application

export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
};

// ===== SHAPE =====
// Border radius and shape settings

export const shape = {
  borderRadius: 8,
  borderRadiusSmall: 2,
};

// ===== SHADOWS =====
// Shadow definitions for elevation

const defaultShadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];

export const shadows = defaultShadows;
