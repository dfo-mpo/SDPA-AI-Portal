/**
 * Portal home page component.
 * Displays the landing page of the application with a welcome banner
 * and introduction to the DFO AI tools portal.
 */

import React from 'react';
import { Typography, Paper, Box, Alert, useTheme } from '@mui/material';
import { Banner } from '../components/common';
import { useLanguage } from '../contexts';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';
import { getLayoutTranslations } from '../translations/layout';

// import ThemeDebugger from '../components/common/ThemeDebugger'; uncomment to use for theme debugging

export default function Home() {
  const { language } = useLanguage();
  const homePageTranslations = getLayoutTranslations('homePage', language);
  const theme = useTheme();
  const homeStyles = useComponentStyles('homePage');

  return (
    <>
      <Banner
        title={homePageTranslations.title}
        description={homePageTranslations.description}
        backgroundImage="/assets/sockeye-banner.jpg"
        variant="hero"
      />

      <Box sx={homeStyles.container}>
        <Paper variant="outlined" sx={{
          ...homeStyles.paper,
          p: { xs: 3, sm: 4 }  // Increased padding for better spacing
        }}>
          {/* Heading - using mix of home and tool styles for the best appearance */}
          <Typography variant="h4" sx={{
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : '#26374A',
            fontFamily: '"Lato", "Noto Sans", sans-serif',
            fontWeight: 600,
            fontSize: '1.75rem',
            mb: 3,
            lineHeight: 1.3
          }}>
            {homePageTranslations.heading}
          </Typography>
          
          {/* Body text - using tool description style with some enhancements */}
          <Typography variant="body1" sx={{
            fontFamily: '"Lato", "Noto Sans", sans-serif',
            fontSize: '1rem',
            color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[800],
            lineHeight: 1.8,
            mb: 1,
            '& strong': {
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            },
            whiteSpace: 'pre-line'  // Properly handles the line breaks in the text
          }}>
            {homePageTranslations.body}
          </Typography>
        </Paper>

        {/* Alert with improved styling */}
        <Alert 
          severity="warning" 
          sx={{
            mt: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main,
              alignSelf: 'center'
            },
            '& .MuiAlert-message': {
              fontFamily: '"Lato", "Noto Sans", sans-serif',
              fontWeight: 500
            }
          }}
        >
          {homePageTranslations.alert}
        </Alert>
      </Box>
    </>
  );
}