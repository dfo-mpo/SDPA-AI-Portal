/**
 * Component Styles
 * 
 * Reusable style objects for common components and patterns.
 * These styles can be imported and used across different components
 * to maintain consistency.
 */

import { alpha } from '@mui/material/styles';
import { dfoColors, grayPalette } from './themePrimitives';

// ===== CONTAINER STYLES =====

/**
 * Container styles for page sections and content wrappers
 */
export const containerStyles = {
  /**
   * Page container - centers content with responsive padding
   */
  page: (theme) => ({
    width: '100%',
    maxWidth: '1800px',
    mx: 'auto',
    px: { xs: 2, sm: 3, md: 4 },
    py: 3,
  }),
  
  /**
   * Section container - groups related content
   */
  section: (theme) => ({
    my: 3,
    width: '100%',
  }),
  
  /**
   * Content area with card styling
   */
  card: (theme) => ({
    p: 3,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: theme.palette.background.paper,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    width: '100%',
  }),
};

// ===== LAYOUT STYLES =====

/**
 * Layout patterns using flexbox and grid
 */
export const layoutStyles = {
  /**
   * Flexbox column layout
   */
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  /**
   * Flexbox row layout with aligned items
   */
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  /**
   * Centers items both horizontally and vertically
   */
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Spaces items apart horizontally
   */
  spaceBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  /**
   * Responsive grid layout
   */
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
    gap: 2,
  }
};

// ===== BANNER STYLES =====

/**
 * Styles for page headers and banners
 */
export const bannerStyles = {
  /**
   * Container for standard banner
   */
  container: (theme) => ({
    position: 'relative',
    height: '300px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }),
  
  /**
   * Container for hero-sized banner
   */
  heroContainer: (theme) => ({
    position: 'relative',
    height: '350px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }),
  
  /**
   * Content area inside banner
   */
  content: (theme) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: theme.palette.mode === 'dark' ? theme.palette.common.white : dfoColors.darkBlue,
    textAlign: 'left',
    p: 3,
    pl: 6,
    fontFamily: '"Lato", "Noto Sans", sans-serif',
    zIndex: 2,
  }),
  
  /**
   * Banner title styling
   */
  title: (theme) => ({
    mb: 2,
    fontWeight: 700,
    fontSize: '2rem',
    color: theme.palette.mode === 'dark' ? theme.palette.common.white : dfoColors.darkBlue,
    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
  }),
  
  /**
   * Banner title styling for hero banners
   */
  heroTitle: (theme) => ({
    mb: 2,
    fontWeight: 700,
    fontSize: '2.2rem',
    color: theme.palette.mode === 'dark' ? theme.palette.common.white : dfoColors.darkBlue,
    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
  }),
  
  /**
   * Banner description text styling
   */
  description: (theme) => ({
    mb: 3,
    maxWidth: '500px',
    fontSize: '1.1rem',
    fontWeight: 500,
    color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : dfoColors.darkBlue,
    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
  }),
  
  /**
   * Gradient overlay for banners
   */
  gradient: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 15%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
  },
};

// ===== FORM STYLES =====

/**
 * Styles for form elements
 */
export const formStyles = {
  /**
   * Form container
   */
  container: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  }),
  
  /**
   * Form field container
   */
  field: {
    mb: 2,
    width: '100%',
  },
  
  /**
   * Form label
   */
  label: (theme) => ({
    mb: 0.5,
    fontWeight: 500,
    color: theme.palette.text.primary,
  }),
  
  /**
   * Form helper text
   */
  helperText: (theme) => ({
    mt: 0.5,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  }),
  
  /**
   * Form actions container
   */
  actions: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
  },
};

// ===== DASHBOARD STYLES =====

/**
 * Styles for dashboard and tool components
 */
export const dashboardStyles = {
  /**
   * Container for the dashboard
   */
  container: (theme) => ({
    width: '100%',
    maxWidth: '1800px',
    mx: 'auto',
    px: 4,
    display: 'flex',
    alignItems: 'center',
  }),
  
  /**
   * Main wrapper styles
   */
  mainWrapper: (theme, { headerHeight }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: `calc(100vh - ${headerHeight}px)`,
    maxHeight: `calc(100vh - ${headerHeight}px)`,
  }),
  
  /**
   * Content wrapper styles
   */
  contentWrapper: {
    display: 'flex',
    gap: 3,
    mx: 'auto',
    px: 4,
    width: '100%',
    maxWidth: '1800px',
    mt: 3,
    mb: 4,
    alignItems: 'flex-start',
    position: 'relative',
  },
  
  /**
   * Main content area styling
   */
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minHeight: '80vh',
  },
  
  /**
   * Content paper styling
   */
  contentPaper: {
    flexGrow: 1,
    borderRadius: 2,
    bgcolor: 'transparent',
    border: 'none',
    overflow: 'hidden',
    position: 'relative',
  },
  
  /**
   * Loading container styling
   */
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 400,
  },
};

// ===== DROPDOWN STYLES =====

/**
 * Styles for dropdown menus and selection components
 */
export const dropdownStyles = {
  /**
   * Base select element
   */
  select: (theme) => ({
    bgcolor: 'background.default',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    py: 3, // For consistent height matching buttons
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'background.paper',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      bgcolor: 'background.paper',
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    borderRadius: '8px',
    fontFamily: '"Lato", "Noto Sans", sans-serif',
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      minHeight: '50px',
    },
  }),
  
  /**
   * Subheader styling in dropdowns
   */
  subheader: (theme) => ({
    py: 1,
    px: 2,
    fontWeight: 700,
    bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.common.white,
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : dfoColors.darkBlue,
  }),
  
  /**
   * Menu item styling
   */
  menuItem: {
    py: 2.5,
    px: 1.55,
    minHeight: '50px',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  },
  
  /**
   * Icon in list items
   */
  listItemIcon: {
    minWidth: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ===== TOOL-SPECIFIC STYLES =====

/**
 * Styles for tool pages and components
 */
export const toolStyles = {
  /**
   * Tool container
   */
  container: {
    width: '100%',
    maxWidth: 800,
  },
  
  /**
   * Tool description text
   */
  description: (theme) => ({
    color: 'text.primary',
    lineHeight: 1.6,
    mb: 2,
    fontWeight: 400,
  }),
  
  /**
   * Container for action buttons
   */
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  
  /**
   * Primary action button
   */
  actionButton: (theme) => ({
    textTransform: 'none',
    px: 3,
    py: 1,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': { 
      bgcolor: 'primary.dark'
    }
  }),
};

// ===== SETTINGS STYLES =====

/**
 * Styles for settings components
 */
export const settingsStyles = {
  /**
   * Container for settings
   */
  container: (theme) => ({
    display: 'flex', 
    flexDirection: 'column', 
    gap: 3, 
    py: 1,
  }),
  
  /**
   * Form control with label
   */
  formLabel: {
    mb: 0.1,
    fontWeight: 500,
    color: 'text.primary',
  },
  
  /**
   * Header row with optional tooltip
   */
  headerRow: {
    display: 'flex', 
    alignItems: 'center',
    mb: 0.75,
  },
  
  /**
   * Settings divider
   */
  divider: {
    my: 1.5,
  },
  
  /**
   * Helper text styling
   */
  helperText: (theme) => ({
    color: 'text.secondary',
    fontSize: '0.75rem',
  }),
  
  /**
   * Row styling
   */
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  /**
   * Form control label
   */
  formControlLabel: {
    m: 0,
    '& .MuiFormControlLabel-label': {
      ml: 1
    }
  },
  
  /**
   * Tooltip icon
   */
  tooltipIcon: {
    ml: 1.5
  },
  
  /**
   * Checkbox group
   */
  checkboxGroup: {
    ml: 1,
    mt: -1,
    '& .MuiFormControlLabel-root': {
      marginLeft: 0,
      marginRight: 0
    }
  },
  /**
   * Checkbox group container
   */
  checkboxGroupContainer: {
    display: 'flex', 
    flexDirection: 'column',
  },
};

export const toolSettingsCommonStyles = {
  sectionHeader: {
    fontWeight: 500,
  },
  formRow: {
    justifyContent: 'flex-start',
    '& .MuiFormControlLabel-label': { ml: 2 }
  },
  sliderContainer: {
    px: 2,
    mt: 1,
    mb: 1,
  },
  slider: {
    '& .MuiSlider-markLabel': {
      fontSize: '0.75rem'
    }
  },
  radioGroup: {
    ml: 1
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    mb: 2
  },
  radioTypeRow: {
    display: 'flex',
    alignItems: 'center'
  },
  colorPicker: {
    appearance: 'none',
    width: 40,
    height: 24,
    cursor: 'pointer',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    p: 0,
    '&::-webkit-color-swatch': {
      border: 'none',
      borderRadius: '2px'
    },
    '&::-webkit-color-swatch-wrapper': {
      border: 'none',
      borderRadius: '2px',
      padding: 0
    }
  },
  fixedWidthContainer: {
    width: 68,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  checkboxGroup: {
    ml: 1, 
    mt: -1, 
    '& .MuiFormControlLabel-root': {
      marginLeft: 0,
      marginRight: 0
    }
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexGrow: 1
  }
};

export const sensitivityScoreStyles = {
  button: {
    width: '100%',
    my: 1,
  },
  weightGrid: {
    mb: 1,
  },
  weightLabel: (theme) => ({
    fontSize: theme.typography.caption.fontSize,
  }),
  weightInput: {
    width: '100%',
    '& .MuiInputBase-root': { height: 28 },
    '& .MuiInputBase-input': { py: 0.5, px: 1, textAlign: 'center' },
  },
  totalBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 1,
  },
  totalLabel: {
    color: 'text.secondary',
  },
  totalValue: {
    fontWeight: 500,
  },
  resetButton: {
    ml: 'auto',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightLabelError: {
    color: 'error.main',
    fontWeight: 500
  },
  weightInputError: {
    '& .MuiInputBase-root': {
      transition: 'background-color 0.3s ease',
      backgroundColor: 'error.lighter',
    }
  },
  headerLabelError: {
    color: 'error.main',
    fontWeight: 600
  },
  totalBoxError: {
    p: 1, 
    borderRadius: 1,
    backgroundColor: 'error.light',
    transition: 'background-color 0.3s ease',
  }
};


export const govHeaderStyles = {
  container: (theme) => ({
    width: '100%',
    bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#FFFFFF',
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#333333',
    borderBottom: '1px solid',
    borderColor: '#DC4D01',
    py: 2,
    boxShadow: 'none',
  }),
  content: {
    maxWidth: 1800,
    width: '100%',
    mx: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    ml: 0,
  },
  logo: {
    height: 55,
    maxHeight: '80px',
    width: 'auto',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  departmentTitle: (theme) => ({
    display: { xs: 'none', md: 'block' },
    ml: 2,
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#333333',
    fontWeight: 400,
    fontSize: '1rem',
    letterSpacing: '0.01em',
    opacity: 0.9,
  }),
  languageButton: (theme) => ({
    fontWeight: 500,
    color: theme.palette.text.primary,
    borderRadius: '8px',
    padding: '4px 12px',
    minWidth: '100px',
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease',
    textTransform: 'none',
    '&:hover': { 
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.text.primary,
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  }),
};

// ===== CUSTOM SWITCH STYLES =====

export const customSwitchStyles = {
  // The switchBase style function now accepts theme and a props object.
  switchBase: (theme, { isSmall }) => {
    // Define size parameters based on the size prop
    const sizes = isSmall
      ? {
          width: 32,
          height: 18,
          thumbSize: 14,
          translateX: 14,
        }
      : {
          width: 42,
          height: 26,
          thumbSize: 22,
          translateX: 16,
        };

    return {
      width: sizes.width,
      height: sizes.height,
      padding: 0,
      '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: '2px',
        transitionDuration: '300ms',
        '&.Mui-checked': {
          transform: `translateX(${sizes.translateX}px)`,
          color: '#fff',
          '& + .MuiSwitch-track': {
            backgroundColor: theme.palette.primary.main,
            opacity: 1,
            border: 0,
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
          },
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
          color: theme.palette.grey[100],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.3,
        },
      },
      '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: sizes.thumbSize,
        height: sizes.thumbSize,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      },
      '& .MuiSwitch-track': {
        borderRadius: sizes.height / 2,
        backgroundColor: theme.palette.grey[400],
        opacity: 1,
      },
    };
  },
};
// ===== MENU BUTTON STYLES =====

export const menuButtonStyles = {
  badge: (theme) => ({
    '& .MuiBadge-badge': { 
      right: 2, 
      top: 2 
    },
  }),
};

// ===== OPTIONS MENU STYLES =====

export const optionsMenuStyles = {
  menuButton: {
    borderColor: 'transparent',
  },
  menu: {
    list: {
      padding: '4px',
    },
    paper: {
      padding: 0,
    },
    divider: {
      margin: '4px -4px',
    },
  },
  logoutMenuItem: {
    '& .MuiListItemIcon-root': {
      ml: 'auto',
      minWidth: 0,
    },
  },
};
// ===== COLOR MODE ICON DROPDOWN STYLES =====

export const colorModeIconDropdownStyles = {
  iconButton: (theme) => ({
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '8px',
    padding: '8px',
    color: 'text.primary',
    backgroundColor: 'background.paper',
    '&:hover': {
      backgroundColor: 'action.hover',
      borderColor: 'text.primary',
    },
  }),
  // Wrap the menu styles in a function so the hook processes them:
  menu: (theme) => ({
    paper: {
      elevation: 0,
      sx: {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        mt: 1,
        minWidth: '120px',
      },
    },
  }),
};

// ===== AI TOOLS DROPDOWN STYLES =====

export const aiToolsDropdownStyles = {
  select: (theme) => ({
    bgcolor: 'background.default',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    py: 4, // AI TOOLS HOME button height
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'background.paper',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      bgcolor: 'background.paper',
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    '& .MuiPaper-root': {
      bgcolor: 'background.paper',
    },
    '& .MuiMenuItem-root': {
      py: 2,        // Match StaticToolList py value
      px: 2,        // Match StaticToolList px value
      minHeight: '48px', // Match StaticToolList minHeight
      '&:hover': {
        bgcolor: 'action.hover',
      },
      '&.Mui-selected': {
        bgcolor: 'action.selected',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      },
    },
    borderRadius: '8px',
    fontFamily: '"Lato", "Noto Sans", sans-serif',
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      minHeight: '60px',
    },
  }),
  menuItem: {
    py: 2,
    px: 2,
    minHeight: '48px',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  },
  listItemIcon: {
    minWidth: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subheader: (theme) => ({
    py: 1,
    px: 2,
    fontWeight: 700,
    bgcolor: theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.common.white,
    color: theme.palette.mode === 'dark'
      ? theme.palette.text.primary
      : '#26374A',
  }),
};

export const staticToolListStyles = {
  paper: (theme) => ({
    mt: 0,
    mb: 0,
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  }),
  header: (theme) => ({
    p: 2, 
    borderBottom: '1px solid', 
    borderColor: 'divider',
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.dark, 0.1) 
      : alpha(theme.palette.primary.light, 0.1),
  }),
  headerContent: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTypography-root': {
      color: theme.palette.mode === 'dark' 
        ? 'text.primary' 
        : '#26374A'
    }
  }),
  titleContainer: {
    display: 'flex', 
    alignItems: 'center', 
    gap: 1
  },
  title: (theme) => ({
    fontWeight: 600,
    color: theme.palette.mode === 'dark'
      ? 'text.primary'
      : '#26374A',
    mb: 0
  }),
  subtitle: {
    color: 'text.secondary',
    fontWeight: 400,
    ml: '28px'
  },
  listItem: {
    py: 2,     
    px: 2,             
    minHeight: '48px',
    borderLeft: '3px solid transparent',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: 'action.hover',
      borderLeftColor: 'primary.main',
    },
  },
  subheader: (theme) => ({
    py: 2,
    fontSize: '0.875rem',
    lineHeight: '2rem',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    color: 'text.primary',
    fontWeight: 600,
  })
  
};

export const homePageStyles = (theme) => ({
  container: {
    maxWidth: 800,
    mt: 4,
    mx: 'left', // centers the container horizontally
  },
  paper: {
    p: 3,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  heading: {
    mb: 2,
    fontWeight: 600,
  },
  body: {
    lineHeight: 1.6,
  },
  alert: {
    mt: 3,
  },
});

export const frenchTranslationStyles = (theme) => ({
  container: {
    // your container styling here
  },
  resultContainer: {
    // your result container styling here
  },
  translationPaper: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(2),
    maxHeight: '400px',
    overflow: 'auto'
  },
  translationText: {
    whiteSpace: 'pre-wrap',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: 1.6
  },
});

export const scaleAgeingStyles = {
  container: {
    // The main container styling for your tool
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',            // center it horizontally
    padding: '1rem',            // some padding inside
    backgroundColor: '#f9f9f9',  // light background
    border: '1px solid #ddd',   // subtle border
    borderRadius: '8px',        // rounded corners
  },
  resultCard: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  resultContainer: {
    // A container to hold text lines in a column
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  infoLine: {
    // A small style for each line of info
    margin: '0.25rem 0',
    fontSize: '1rem',
  },
  resultImage: {
    // Controls how the scale image is displayed
    width: '100%',
    maxWidth: '600px',        
    height: 'auto',
    marginTop: '1rem',
    border: '1px solid #ccc',  // subtle border around the image
    borderRadius: '4px',       // slightly rounded corners
  },
};

export const piiRedactorStyles = (theme) => ({
  // If you need a container style, for example:
  container: {
    width: '100%',
    maxWidth: 800,
  },
  // Style for the result container if used in PIIRedactor
  resultContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // You can add more styles as needed, for example:
  downloadButton: {
    marginTop: theme.spacing(2),
  },
});

export const signInStyles = (theme) => ({
  styledCard: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    maxWidth: { xs: '100%', sm: '450px' },
    boxShadow:
      theme.palette.mode === 'dark'
        ? 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px'
        : 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  },
  signInContainer: {
    height: '100vh',
    minHeight: '100%',
    padding: { xs: theme.spacing(2), sm: theme.spacing(4) },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: -1,
      inset: 0,
      backgroundImage:
        theme.palette.mode === 'dark'
          ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
          : 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
      backgroundRepeat: 'no-repeat',
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 2,
  },
  title: {
    width: '100%',
    fontSize: 'clamp(2rem, 10vw, 2.15rem)',
  },
  forgotPassword: {
    alignSelf: 'center',
  },
  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  signupText: {
    textAlign: 'center',
  },
});

export const forgotPasswordStyles = (theme) => ({
  dialogContent: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: 2, 
    width: '100%'
  },
  dialogActions: {
    pb: 3, 
    px: 3
  },
  dialog: {
    backgroundImage: 'none'
  }
});

export const iconStyles = {
  sitemarkIcon: {
    height: 40,
    width: 120,
  },
};



export default {
    container: containerStyles,
    layout: layoutStyles,
    banner: bannerStyles,
    form: formStyles,
    dashboard: dashboardStyles,
    dropdown: dropdownStyles,
    tool: toolStyles,
    settings: settingsStyles,
    govHeader: govHeaderStyles,
    customSwitch: customSwitchStyles,
    menuButton: menuButtonStyles,
    optionsMenu: optionsMenuStyles,
    colorModeIconDropdown: colorModeIconDropdownStyles,
    aiToolsDropdown: aiToolsDropdownStyles,
    staticToolList: staticToolListStyles,
    toolSettingsCommon: toolSettingsCommonStyles,
    sensitivityScore: sensitivityScoreStyles,
    icons: iconStyles,
    homePage: homePageStyles,
    scaleAgeing: scaleAgeingStyles,
    piiRedactor: piiRedactorStyles,
    signIn: signInStyles,
    forgotPassword: forgotPasswordStyles,
  };