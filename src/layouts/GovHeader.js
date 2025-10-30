/**
 * Government of Canada Header Component
 * 
 * Displays the official Government of Canada logo, department name,
 * language toggle, and theme selector at the top of every page.
 */

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Stack, 
  Button, 
  Typography, 
  Divider, 
  useTheme 
} from '@mui/material';
import { ColorModeIconDropdown } from '../components/common';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage, useAuth } from '../contexts';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';
import { getLayoutTranslations } from '../translations/layout';
import { trackEvent } from '../utils/analytics';

/**
 * Government header component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.setHeaderHeight - Callback to set header height
 * @returns {JSX.Element} The rendered component
 */
export default function GovHeader({ setHeaderHeight }) {
  const { language, toggleLanguage } = useLanguage();
  const headerTranslations = getLayoutTranslations('header', language);
  const headerRef = useRef(null);
  const theme = useTheme();
  const styles = useComponentStyles('govHeader');
  const isAuth = useAuth();

  // Measure header height and pass it to parent component
  useEffect(() => {
    if (headerRef.current) {
      const computedHeight = headerRef.current.offsetHeight;
      const computedStyle = window.getComputedStyle(headerRef.current);
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const totalPadding = paddingTop + paddingBottom;

      setHeaderHeight(computedHeight + totalPadding);
    }
  }, [setHeaderHeight]);

  // Choose logo based on theme
  const logoSrc = theme.palette.mode === 'dark' ? '/assets/dark.png' : '/assets/light.png';

  return (
    <Box sx={styles.outerContainer}>
      <Box ref={headerRef} sx={styles.container}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={styles.content}>
          <Box sx={styles.logoContainer}>
            <img 
              src={logoSrc} 
              alt="Government of Canada / Gouvernement du Canada" 
              style={styles.logo} 
            />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100%' }}>
              <Divider orientation="vertical" sx={{ height: 20 }} />
              <Typography sx={styles.departmentTitle}>
                {headerTranslations.department}
              </Typography>
            </Box> 
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button 
              size="small" 
              onClick={() => {
                const nextLang = language === 'en' ? 'fr' : 'en';
                trackEvent('Language Switch', `Switched to ${nextLang.toUpperCase()}`, 'Language Toggle');
                toggleLanguage();
              }}
              startIcon={<TranslateIcon />} 
              sx={styles.languageButton}
            >
              {language === 'en' ? 'Français' : 'English'}
            </Button>
            <ColorModeIconDropdown />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

GovHeader.propTypes = {
  /** Callback to set header height */
  setHeaderHeight: PropTypes.func.isRequired
};