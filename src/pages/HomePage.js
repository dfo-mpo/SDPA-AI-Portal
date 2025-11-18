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
      <Box sx={homeStyles.homePageWrapper}>
        <Banner
          title={homePageTranslations.title}
          description={homePageTranslations.description}
          backgroundImage="/assets/sockeye-banner.jpg"
          variant="hero"
        />

        <Box sx={homeStyles.container}>
          <Paper variant="outlined" sx={homeStyles.paper}>
            {/* Heading - using mix of home and tool styles for the best appearance */}
            <Typography variant="h4" sx={homeStyles.heading}>
              {homePageTranslations.heading}
            </Typography>
            
            {/* Body text - using tool description style with some enhancements */}
            <Typography variant="body1" sx={homeStyles.body}>
              {homePageTranslations.body}
            </Typography>
          </Paper>

          {/* Alert with improved styling */}
          <Alert 
            severity="warning" 
            sx={homeStyles.alert}
          >
            {homePageTranslations.alert}
          </Alert>
        </Box>
      </Box>
    </>
  );
}