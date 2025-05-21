import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useLanguage, useTerms } from '../../contexts';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { getFooterTranslations } from '../../translations/components/footer';


function Footer({ headerHeight }) { // Accept headerHeight as prop
  const theme = useTheme();
  const { language } = useLanguage();
  const { openTermsModal } = useTerms();
  const footerStyles = useComponentStyles('footer');

  // Get the current date for "Last Updated"
  const lastUpdated = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const t = getFooterTranslations(language, lastUpdated);

  const logoSrc =
    theme.palette.mode === 'dark'
      ? '/assets/canada-dark-footer.png'
      : '/assets/canada-light-footer.png';

  const handleViewTerms = () => {
    openTermsModal();
  };

  return (
    <Box
      component="footer"
      sx={{
        ...footerStyles.container,
        position: 'sticky',
        bottom: 0,  // Ensure it stays at the bottom
        left: 0,
        right: 0,
        zIndex: 10
      }}
    >
      <Box sx={footerStyles.content}>
        {/* Left-Side: Horizontal Row of items */}
        <Box sx={footerStyles.leftContent}>
          <Typography variant="body2" sx={footerStyles.copyrightText}>
            {t.copyright}
          </Typography>

          <Typography variant="body2" sx={footerStyles.updatedText}>
            {t.lastUpdated}
          </Typography>

          <Button
            size="small"
            onClick={handleViewTerms}
            sx={footerStyles.termsButton}
          >
            {t.terms}
          </Button>
        </Box>

        {/* Right-Side: Canada Logo */}
        <Box sx={footerStyles.logoContainer}>
          <img
            src={logoSrc}
            alt="Government of Canada"
            style={footerStyles.logo}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
