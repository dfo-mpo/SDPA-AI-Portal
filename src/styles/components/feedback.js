/**
 * Material UI Feedback Component Customizations
 * 
 * This file contains theme overrides for feedback-related components including:
 * - Alerts
 * - Dialogs
 * - Snackbars
 * - Progress indicators
 * 
 * These customizations ensure consistent styling for components that provide 
 * user feedback throughout the application.
 */

import { alpha } from '@mui/material/styles';
import { gray, orange } from '../themePrimitives';

/**
 * Alert component customizations
 * Makes alerts more visually distinct and on-brand
 */
export const AlertCustomization = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 10,
      backgroundColor: orange[100],
      color: (theme.vars || theme).palette.text.primary,
      border: `1px solid ${alpha(orange[300], 0.5)}`,
      '& .MuiAlert-icon': {
        color: orange[500],
      },
      // Dark mode styles
      ...theme.applyStyles('dark', {
        backgroundColor: `${alpha(orange[900], 0.5)}`,
        border: `1px solid ${alpha(orange[800], 0.5)}`,
      }),
      // Variants for different severity levels
      variants: [
        {
          props: { severity: 'success' },
          style: {
            backgroundColor: alpha(theme.palette.success.light, 0.2),
            borderColor: alpha(theme.palette.success.main, 0.5),
            '& .MuiAlert-icon': {
              color: theme.palette.success.main,
            },
          },
        },
        {
          props: { severity: 'error' },
          style: {
            backgroundColor: alpha(theme.palette.error.light, 0.2),
            borderColor: alpha(theme.palette.error.main, 0.5),
            '& .MuiAlert-icon': {
              color: theme.palette.error.main,
            },
          },
        },
      ],
    }),
  },
};

/**
 * Dialog component customizations
 * Makes dialogs on-brand with consistent styling
 */
export const DialogCustomization = {
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiDialog-paper': {
        borderRadius: '10px',
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        // Add subtle shadows for depth
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.8)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        // Ensure proper spacing inside dialog
        '& .MuiDialogTitle-root': {
          padding: theme.spacing(3),
        },
        '& .MuiDialogContent-root': {
          padding: theme.spacing(3),
        },
        '& .MuiDialogActions-root': {
          padding: theme.spacing(2, 3, 3),
        },
      },
    }),
  },
};

/**
 * LinearProgress component customizations
 * Makes progress indicators more visible and on-brand
 */
export const LinearProgressCustomization = {
  styleOverrides: {
    root: ({ theme }) => ({
      height: 8,
      borderRadius: 8,
      backgroundColor: gray[200],
      // Dark mode styles
      ...theme.applyStyles('dark', {
        backgroundColor: gray[800],
      }),
    }),
    // Bar that shows progress
    bar: ({ theme }) => ({
      borderRadius: 8,
      // Add subtle gradient for visual interest
      backgroundImage: `linear-gradient(to right, ${
        theme.palette.primary.main
      }, ${
        theme.palette.primary.dark
      })`,
    }),
  },
};

/**
 * CircularProgress component customizations
 */
export const CircularProgressCustomization = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.primary.main,
    }),
  },
};

/**
 * Snackbar component customizations
 */
export const SnackbarCustomization = {
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiSnackbarContent-root': {
        borderRadius: 8,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.8)'
          : '0 4px 20px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
};

/**
 * Backdrop component customizations
 */
export const BackdropCustomization = {
  styleOverrides: {
    root: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(2px)',
    },
  },
};

/**
 * Export all feedback component customizations
 */
export const feedbackCustomizations = {
  MuiAlert: AlertCustomization,
  MuiDialog: DialogCustomization,
  MuiLinearProgress: LinearProgressCustomization,
  MuiCircularProgress: CircularProgressCustomization,
  MuiSnackbar: SnackbarCustomization,
  MuiBackdrop: BackdropCustomization,
};