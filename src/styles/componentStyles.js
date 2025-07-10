/**
 * Component Styles
 * 
 * Reusable style objects for common components and patterns.
 * These styles can be imported and used across different components
 * to maintain consistency.
 */

import { alpha } from '@mui/material/styles';
import { dfoColors } from './themePrimitives';

// ====== COMMON OR BASE STYLES USED ACROSS MULTIPLE OBJECTS ======

// 1. A shared “flexBetween” for consistently spaced rows
const flexBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

// 2. A shared “bannerContainerBase” for normal vs. hero banners
const bannerContainerBase = (theme) => ({
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

// 3. A shared “bannerTitleBase” for normal vs. hero banner titles
const bannerTitleBase = {
  mb: 2,
  fontWeight: 700,
  // Always use dfoColors.darkBlue
  color: dfoColors.darkBlue,
  textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
};

// ===== CONTAINER STYLES =====
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
  section: () => ({
    my: 3,
    width: '100%',
  }),

  /**
   * Content area with card styling
   */
  card: (theme) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor:
      theme.palette.mode === 'dark'
        ? 'rgba(0, 0, 0, 0.2)'
        : dfoColors.white,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    width: '100%',
    minWidth: 0,
    overflowX: 'auto',
    p: { xs: 2, sm: 3 },
  }),
};

// ===== LAYOUT STYLES =====
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
   * Unified “flexBetween” for spaced items
   */
  flexBetween, // replaced old "spaceBetween" with new name

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
  },
};

// ===== BANNER STYLES =====
export const bannerStyles = {
  /**
   * Container for standard banner
   */
  container: (theme) => ({
    ...bannerContainerBase(theme), // use shared base
    height: '300px',
  }),

  /**
   * Container for hero-sized banner
   */
  heroContainer: (theme) => ({
    ...bannerContainerBase(theme),
    height: '350px',
    borderRadius: '8px 8px 0 0px',
    overflow: 'hidden',
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
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.common.white
        : dfoColors.darkBlue,
    textAlign: 'left',
    p: 3,
    pl: 6,
    fontFamily: '"Lato", "Noto Sans", sans-serif',
    zIndex: 2,
  }),

  /**
   * Banner title styling
   */
  title: () => ({
    ...bannerTitleBase,
    fontSize: '2rem',
  }),

  /**
   * Banner title styling for hero banners
   */
  heroTitle: () => ({
    ...bannerTitleBase,
    fontSize: '2.2rem',
  }),

  /**
   * Banner description text styling
   */
  description: () => ({
    mb: 3,
    maxWidth: '500px',
    fontSize: '1.1rem',
    fontWeight: 500,
    color: dfoColors.darkBlue,
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
    background:
      'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 15%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
  },
};

// ===== FORM STYLES =====
export const formStyles = {
  container: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  }),

  field: {
    mb: 2,
    width: '100%',
  },

  label: (theme) => ({
    mb: 0.5,
    fontWeight: 500,
    color: theme.palette.text.primary,
  }),

  helperText: (theme) => ({
    mt: 0.5,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  }),

  actions: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
  },
};

// ===== DASHBOARD STYLES =====
export const dashboardStyles = {
  container: (theme) => ({
    width: '100%',
    maxWidth: '1800px',
    mx: 'auto',
    px: { xs: 2, sm: 4 },
    display: 'flex',
    alignItems: 'center',
  }),

  mainWrapper: (theme, { headerHeight }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: `calc(100vh - ${headerHeight}px)`,
    overflow: 'auto',
  }),

  contentWrapper: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 3,
    mx: 'auto',
    px: { xs: 1, sm: 2, md: 4 },
    width: '100%',
    maxWidth: '1800px',
    flexGrow: 1,
    overflow: 'visible',
    position: 'relative',
  },

  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minHeight: 'auto',
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
  },

  contentPaper: {
    flexGrow: 1,
    borderRadius: 2,
    bgcolor: 'transparent',
    border: 'none',
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    minWidth: 0,
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 400,
  },
};

export const toolContentWrapperStyles = {
  card: (theme) => ({
    minWidth: 0,
    width: '100%',
    overflowX: 'auto',
    borderRadius: '8px 0px 8px 8px',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(13, 25, 43, 0.7)'
        : dfoColors.white,
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : dfoColors.lightGray,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.05)',
  }),
  content: {
    p: { xs: 2.5, sm: 3.5 },
    '&:last-child': { pb: { xs: 2.5, sm: 3.5 } },
    overflowWrap: 'break-word',
  },
};

// ===== DROPDOWN STYLES =====
export const dropdownStyles = {
  select: (theme) => ({
    bgcolor: 'background.default',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    py: 3,
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

  subheader: (theme) => ({
    py: 1,
    px: 2,
    fontWeight: 700,
    bgcolor:
      theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.common.white,
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.text.primary
        : dfoColors.darkBlue,
  }),

  menuItem: {
    py: 2.5,
    px: 1.55,
    minHeight: '50px',
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
};

// ===== TOOL-SPECIFIC STYLES =====
export const toolStyles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto',
  },

  description: (theme) => ({
    color:
      theme.palette.mode === 'dark'
        ? dfoColors.lightGray
        : dfoColors.darkBlue,
    lineHeight: 1.8,
    mb: 3,
    fontWeight: 400,
    fontSize: '1rem',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto',
    width: '100%',
    maxWidth: '100%',
    '& strong': {
      fontWeight: 600,
      color:
        theme.palette.mode === 'dark'
          ? dfoColors.white
          : dfoColors.darkBlue,
    },
  }),

  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    width: '100%',
    mb: 2,
    minWidth: 0,
  },

  actionButton: (theme) => ({
    textTransform: 'none',
    px: { xs: 2, sm: 3 },
    py: 1.5,
    bgcolor: dfoColors.darkBlue,
    color: dfoColors.white,
    fontWeight: 500,
    borderRadius: '4px',
    '&:hover': {
      bgcolor: 'rgba(38, 55, 74, 0.9)',
    },
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 2px 5px rgba(0,0,0,0.2)'
        : '0 2px 5px rgba(0,0,0,0.1)',
    fontSize: { xs: '0.875rem', sm: '1rem' },
    minWidth: { xs: 'auto', sm: '150px' },
  }),

  videoContainer: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    width: '100%',
    mt: 2,
    mb: 4,
    overflow: 'visible',
  },

  videoSection: {
    flex: 1,
    minWidth: 0,
    '& > *': {
      maxWidth: '100%',
    },
  },

  video: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    backgroundColor: '#000',
    borderRadius: 1,
  },

  resultContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto',
  },
};

// ===== SETTINGS STYLES =====
export const settingsStyles = {
  container: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    py: 1,
  }),

  formLabel: {
    mb: 0.1,
    fontWeight: 500,
    color: 'text.primary',
  },

  headerRow: {
    // replaced usage of “flexBetween” if it was identical
    ...flexBetween,
    mb: 0.75,
  },

  divider: {
    my: 1.5,
  },

  helperText: (theme) => ({
    color: 'text.secondary',
    fontSize: '0.75rem',
  }),

  // row was originally: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }
  // so we unify to "flexBetween" and keep width: '100%'
  row: {
    ...flexBetween,
    width: '100%',
  },

  formControlLabel: {
    m: 0,
    '& .MuiFormControlLabel-label': {
      ml: 1,
    },
  },

  tooltipIcon: {
    ml: 1.5,
  },

  checkboxGroup: {
    ml: 1,
    mt: -1,
    '& .MuiFormControlLabel-root': {
      marginLeft: 0,
      marginRight: 0,
    },
  },

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
    '& .MuiFormControlLabel-label': { ml: 2 },
  },
  sliderContainer: {
    px: 2,
    mt: 1,
    mb: 1,
  },
  slider: {
    '& .MuiSlider-markLabel': {
      fontSize: '0.75rem',
    },
  },
  radioGroup: {
    ml: 1,
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    mb: 2,
  },
  radioTypeRow: {
    display: 'flex',
    alignItems: 'center',
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
      borderRadius: '2px',
    },
    '&::-webkit-color-swatch-wrapper': {
      border: 'none',
      borderRadius: '2px',
      padding: 0,
    },
  },
  fixedWidthContainer: {
    width: 68,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  checkboxGroup: {
    ml: 1,
    mt: -1,
    '& .MuiFormControlLabel-root': {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  // replaced usage of “flexBetween”
  flexBetween,
};

export const sensitivityScoreStyles = {
  // usage below replaced with layoutStyles.flexBetween or the local “flexBetween”
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
    '& .MuiInputBase-input': {
      py: 0.5,
      px: 1,
      textAlign: 'center',
    },
  },
  totalBox: {
    ...flexBetween,
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
  flexBetween, // removed the original duplication
  weightLabelError: {
    color: 'error.main',
    fontWeight: 500,
  },
  weightInputError: {
    '& .MuiInputBase-root': {
      transition: 'background-color 0.3s ease',
      backgroundColor: 'error.lighter',
    },
  },
  headerLabelError: {
    color: 'error.main',
    fontWeight: 600,
  },
  totalBoxError: {
    p: 1,
    borderRadius: 1,
    backgroundColor: 'error.light',
    transition: 'background-color 0.3s ease',
    ...flexBetween,
  },
};

export const govHeaderStyles = {
  outerContainer: {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    background: (theme) =>
      theme.palette.mode === 'light'
        ? `linear-gradient(to left, ${alpha(
            theme.palette.primary.light,
            0.15
          )} 0%, 
           ${alpha(theme.palette.primary.light, 0.1)} 30%, 
           rgba(255,255,255,1) 80%)`
        : `linear-gradient(to left, hsl(210, 100%, 12%) 0%, 
           hsl(210, 100%, 8%) 70%, 
           rgba(0,0,0,1) 85%)`,
    borderBottom: '1px solid',
    borderColor: '#DC4D01',
    py: 2,
    boxShadow: (theme) =>
      theme.palette.mode === 'light'
        ? '0 2px 4px rgba(0,0,0,0.03)'
        : '0 2px 6px rgba(0,0,0,0.2)',
  },
  container: {
    width: '100%',
    color: (theme) =>
      theme.palette.mode === 'dark'
        ? theme.palette.text.primary
        : '#333333',
  },
  content: {
    maxWidth: 1800,
    width: '100%',
    mx: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3.5,
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
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.text.primary
        : dfoColors.darkBlue,
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '0.01em',
  }),
  languageButton: (theme) => ({
    fontWeight: 500,
    color: theme.palette.text.primary,
    borderRadius: '8px',
    padding: '4px 12px',
    minWidth: '100px',
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    textTransform: 'none',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(0, 0, 0, 0.5)',
      borderColor: theme.palette.text.primary,
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),
};

// ===== CUSTOM SWITCH STYLES =====
export const customSwitchStyles = {
  switchBase: (theme, { isSmall }) => {
    const sizes = isSmall
      ? { width: 32, height: 18, thumbSize: 14, translateX: 14 }
      : { width: 42, height: 26, thumbSize: 22, translateX: 16 };

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
      top: 2,
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
    borderColor: theme.palette.divider,
    borderRadius: '8px',
    padding: '8px',
    color: theme.palette.text.primary,
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(0, 0, 0, 0.5)',
      borderColor: theme.palette.text.primary,
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },
    transition: 'all 0.2s ease',
  }),
  menu: (theme) => ({
    paper: {
      elevation: 0,
      sx: {
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: '8px',
        mt: 1,
        minWidth: '120px',
        backgroundColor: theme.palette.background.paper,
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
    py: 4,
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
      py: 2,
      px: 2,
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
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
      padding: '20px',
      minHeight: '60px',
      whiteSpace: 'normal',
      fontSize: '0.97rem',
    },
  }),
  menuItem: {
    py: 2,
    px: 2,
    minHeight: '48px',
    '&:hover': {
      bgcolor: 'action.hover',
    },
    '& .MuiTypography-root': {
      whiteSpace: 'normal',
      fontSize: '1rem',
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
    bgcolor:
      theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.common.white,
    color:
      theme.palette.mode === 'dark'
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
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.25)
        : alpha(theme.palette.primary.light, 0.15),
  }),
  headerContent: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTypography-root': {
      color:
        theme.palette.mode === 'dark' ? 'text.primary' : '#26374A',
    },
  }),
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  title: (theme) => ({
    fontWeight: 600,
    color:
      theme.palette.mode === 'dark' ? 'text.primary' : '#26374A',
    mb: 0,
  }),
  subtitle: {
    color: 'text.secondary',
    fontWeight: 400,
    ml: '28px',
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
    py: 1,
    pb: 0.5,
    fontSize: '0.875rem',
    lineHeight: '1.8rem',
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    color: 'text.primary',
    fontWeight: 600,
    marginBottom: 0,
  }),
};

export const homePageStyles = (theme) => ({
  container: {
    maxWidth: 800,
    mt: 4,
    mx: 'left',
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
  container: {},
  resultContainer: {},
  translationPaper: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(2),
    maxHeight: '400px',
    overflow: 'auto',
  },
  translationText: {
    whiteSpace: 'pre-wrap',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: 1.6,
  },
});

export const scaleAgeingStyles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(18, 18, 18, 0.8)'
        : '#f9f9f9',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
  },
  resultCard: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(30, 30, 30, 0.9)'
        : '#fff',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    boxShadow: (theme) =>
      theme.palette.mode === 'dark'
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  resultContainer: {
    width: '100%',
    // marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  infoLine: {
    margin: '0.25rem 0',
    fontSize: '1rem',
    color: (theme) => theme.palette.text.primary,
  },
  resultImageContainer: {
    position: 'relative',
    marginTop: '1rem',
    display: 'inline-block',
  },
  resultImage: {
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
  },
  resultSliceOverlay: {
    position: 'absolute',
    bottom: '50%',
    left: '50%', 
    transform: 'translateX(-50%) translateY(100%)', 
    height: '50%', 
    width: '4px', 
    imageRendering: 'pixelated',
    pointerEvents: 'none',
  },
};

export const piiRedactorStyles = (theme) => ({
  container: {
    width: '100%',
    maxWidth: 800,
  },
  resultContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: theme.spacing(2),
  },
});

export const signInStyles = (theme) => ({
  signInContainer: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'auto',
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0a2351 0%, #1a3a6a 50%, #2c4975 100%)'
        : 'linear-gradient(135deg, #1a3a6a 0%, #7392c0 50%, #ffffff 100%)',
    backgroundSize: 'cover',
    padding: theme.spacing(2),
  },
  styledCard: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    maxWidth: { xs: '100%', sm: '450px' },
    maxHeight: { xs: '100%', sm: '90vh' },
    overflow: 'auto',
    boxShadow:
      theme.palette.mode === 'dark'
        ? 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px'
        : 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
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
    width: '100%',
  },
  dialogActions: {
    pb: 3,
    px: 3,
  },
  dialog: {
    backgroundImage: 'none',
  },
});

export const iconStyles = {
  sitemarkIcon: {
    height: 200,
    width: 250,
  },
};

export const termsAndConditionsStyles = {
  container: (theme) => ({
    padding: theme.spacing(2),
    width: '100%',
    overflow: 'auto',
  }),
  mainTitle: {
    mb: 4,
    fontWeight: 700,
    color: (theme) => theme.palette.primary.main,
    textAlign: 'center',
  },
  section: {
    mb: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  sectionTitle: {
    mb: 1,
    fontWeight: 600,
    color: (theme) => theme.palette.primary.dark,
  },
  sectionText: {
    lineHeight: 1.6,
    mb: 2,
    pl: 1,
    color: (theme) => theme.palette.text.primary,
  },
  divider: {
    my: 2,
  },
};

export const termsModalStyles = {
  dialogPaper: (theme) => ({
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.5)'
        : '0 8px 32px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
  }),
  dialogContent: {
    p: 0,
    overflow: 'hidden',
  },
  dialogTitle: (theme) => ({
    borderBottom: '1px solid',
    borderColor: 'divider',
    py: 2,
    px: 3,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.25)
        : alpha(theme.palette.primary.light, 0.15),
    '& .MuiTypography-root': {
      color:
        theme.palette.mode === 'dark'
          ? theme.palette.text.primary
          : dfoColors.darkBlue,
      fontWeight: 600,
    },
  }),
  contentContainer: (theme) => ({
    width: '100%',
    maxWidth: '100%',
    maxHeight: '60vh',
    overflow: 'auto',
    p: 3,
    bgcolor: theme.palette.background.paper,
  }),
  dialogActions: (theme) => ({
    px: 3,
    py: 2,
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.grey[50],
  }),
  declineButton: {
    mr: 'auto',
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
    },
  },
  acceptButton: (theme) => ({
    minWidth: 120,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.dark
        : theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.dark, 0.9)
          : alpha(theme.palette.primary.main, 0.9),
    },
  }),
  closeButton: {
    minWidth: 100,
  },
};

export const footerStyles = {
  container: (theme) => ({
    width: '100%',
    background:
      theme.palette.mode === 'light'
        ? `linear-gradient(to right, ${alpha(
            theme.palette.primary.light,
            0.15
          )} 0%, 
           ${alpha(theme.palette.primary.light, 0.1)} 30%, 
           rgba(255,255,255,1) 80%)`
        : `linear-gradient(to right, hsl(210, 100%, 12%) 0%, 
           hsl(210, 100%, 8%) 30%, 
           rgba(0,0,0,1) 85%)`,
    borderTop: `1px solid ${alpha(dfoColors.orange, 0.75)}`,
    py: 2,
    px: 3,
    marginTop: 'auto',
    position: 'relative',
    paddingBottom: '20px',
  }),

  content: {
    maxWidth: '1645px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 2,
  },
  leftContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    flexWrap: 'wrap',
  },
  copyrightText: (theme) => ({
    fontFamily: "'Lato', sans-serif",
    fontWeight: 500,
    fontSize: '0.85rem',
    color:
      theme.palette.mode === 'light'
        ? dfoColors.darkBlue
        : theme.palette.text.primary,
  }),
  updatedText: (theme) => ({
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.8rem',
    color:
      theme.palette.mode === 'light'
        ? alpha(dfoColors.darkBlue, 0.8)
        : alpha(theme.palette.text.primary, 0.8),
    display: 'flex',
    alignItems: 'center',
    '&::before': {
      content: '""',
      display: 'inline-block',
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor:
        theme.palette.mode === 'light'
          ? alpha(dfoColors.darkBlue, 0.5)
          : alpha(theme.palette.text.primary, 0.5),
      marginRight: '8px',
    },
  }),
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    pr: 1,
  },
  logo: {
    height: '40px',
    maxWidth: '160px',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    filter: (theme) =>
      theme.palette.mode === 'light'
        ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))'
        : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
  },
  termsButton: (theme) => ({
    textTransform: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    color:
      theme.palette.mode === 'light'
        ? theme.palette.primary.main
        : theme.palette.primary.light,
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'light'
          ? alpha(dfoColors.darkBlue, 0.08)
          : alpha(theme.palette.primary.main, 0.15),
    },
    border: 'none',
    py: 0.5,
    px: 1.5,
    borderRadius: '4px',
    minWidth: 'auto',
    display: 'flex',
    alignItems: 'center',
    '&::before': {
      content: '""',
      display: 'inline-block',
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor:
        theme.palette.mode === 'light'
          ? alpha(dfoColors.darkBlue, 0.5)
          : alpha(theme.palette.text.primary, 0.5),
      marginRight: '8px',
    },
  }),
};

// FileUploadModal styles for CSV Analyzer
export const fileUploadModalStyles = {
  dialogPaper: {
    maxWidth: '900px',
    minHeight: '600px',
    borderRadius: '8px',
  },
  gifContainer: (theme) => ({
    maxWidth: '100%',
    height: '300px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(0,0,0,0.4)'
        : 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
  }),
  gif: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  fileInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mt: 3,
  },
  fileInputBox: (theme) => ({
    border: '1px dashed',
    borderColor: 'divider',
    borderRadius: '4px',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    minHeight: '120px',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: theme.palette.action.hover,
    },
  }),
  fileIcon: {
    color: 'primary.main',
    mb: 1,
  },
  stepperContainer: {
    mt: 2,
    mb: 3,
  },
  uploadButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    mt: 2,
  },
  fileInfoContainer: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 1,
    p: 1.5,
    backgroundColor: theme.palette.action.hover,
    borderRadius: '4px',
  }),
  fileName: {
    fontWeight: 500,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    color: 'text.secondary',
    fontSize: '0.75rem',
  },
};

// CSV Analyzer demo styles
export const csvAnalyzerStyles = {
  container: {
    mt: 2,
    mb: 4,
    width: '100%',
  },
  demoCard: {
    p: 3,
    borderRadius: 2,
  },
  headerContainer: {
    mb: 2,
    display: 'flex',
    alignItems: 'center',
  },
  demoStepsContainer: (theme) => ({
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    bgcolor:
      theme.palette.mode === 'dark'
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(0,0,0,0.02)',
    borderRadius: 1,
  }),
  stepContainer: {
    flex: 1,
    textAlign: 'center',
  },
  gifContainer: {
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 1,
  },
  actionContainer: {
    mt: 3,
    display: 'flex',
    justifyContent: 'center',
  },
  resultCard: {
    mt: 4,
    p: 3,
    borderRadius: 2,
  },
  resultTitle: {
    mb: 2,
    fontWeight: 600,
  },
  alertSuccess: {
    mb: 3,
  },
  resultFooter: {
    mt: 3,
    pt: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
  },
};

// ===== PDF CHATBOT STYLES =====
export const pdfChatbotStyles = {
  chatContainer: {
    mt: 3,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '400px',
    maxHeight: '600px',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  messagesContainer: {
    p: 2,
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    p: 2,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 2,
    maxWidth: '80%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  botMessage: {
    alignSelf: 'flex-start',
    p: 2,
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    maxWidth: '80%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  inputContainer: {
    p: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(0,0,0,0.02)',
  },
  messageInput: {
    flexGrow: 1,
    '& .MuiOutlinedInput-root': {
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.9)',
    },
  },
  tokenProgressBar: {
    height: 4,
    width: '100%',
    '& .MuiLinearProgress-bar': {
      bgcolor: (theme, props) => {
        const percentage = props?.percentage || 0;
        return percentage > 90
          ? theme.palette.error.main
          : percentage > 70
          ? theme.palette.warning.main
          : theme.palette.success.main;
      },
    },
  },
  chatHeader: {
    p: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(0,0,0,0.02)',
  },
  pdfInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  tokenStatusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  tokenCounter: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.05)',
    border: '1px solid',
    borderColor: 'divider',
  },
  tokenText: {
    fontWeight: 500,
    color: 'text.secondary',
    fontSize: '0.75rem',
    letterSpacing: '0.03em',
  },
  temperatureChip: {
    height: '24px',
    borderColor: 'divider',
    '& .MuiChip-label': {
      px: 1,
      fontSize: '0.7rem',
    },
    '& .MuiChip-icon': {
      ml: 0.5,
    },
  },
  resetButton: {
    width: '28px',
    height: '28px',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(255,255,255,0.9)',
    '&:hover': {
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.05)',
    },
  },
  followupQuestion: {
    p: 1,
    borderRadius: 1,
    mt: 1,
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: 'primary.main',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.05)',
    '&:hover': {
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.1)',
    },
    border: '1px solid',
    borderColor: 'divider',
  },
  remainingTokensContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    px: 2,
    py: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(0,0,0,0.2)'
        : 'rgba(0,0,0,0.02)',
  },
  remainingTokensText: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'text.secondary',
  },
};

// ===== EXAMPLE “FENCE COUNTING” STYLES =====
export const fenceCountingStyles = {
  container: {
    width: '100%',
  },
  speciesSection: {
    mt: 0,
  },
  checkboxGroup: {
    mt: 0.5,
    ml: 1,
    '& .MuiFormControlLabel-root': {
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 1,
      height: 30,
    },
  },
  divider: {
    my: 0,
  },
  sectionHeader: {
    mb: 0.5,
  },
};

export const surveyFormStyles = {
  popUpMessage: (theme) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(13, 25, 43, 1)'
        : dfoColors.white,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.05)',
  }),
}

// export all together (optional convenience)
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
  termsAndConditions: termsAndConditionsStyles,
  termsModal: termsModalStyles,
  footer: footerStyles,
  fileUploadModal: fileUploadModalStyles,
  csvAnalyzer: csvAnalyzerStyles,
  frenchTranslation: frenchTranslationStyles,
  pdfChatbot: pdfChatbotStyles,
  toolContentWrapper: toolContentWrapperStyles,
  fenceCounting: fenceCountingStyles,
  surveyForm: surveyFormStyles,
};
