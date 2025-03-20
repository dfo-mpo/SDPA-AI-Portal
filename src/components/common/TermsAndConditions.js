// src/components/common/TermsAndConditions.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Divider } from '@mui/material';
import { useLanguage } from '../../contexts';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { getTermsTranslations } from '../../utils'

function TermsAndConditions({ variant = 'full' }) {
    const { language } = useLanguage();
    const styles = useComponentStyles('termsAndConditions');
  
    // Get the correct language content
    const t = getTermsTranslations(language);
    
    // Create an array of sections based on the content structure
    const allSections = [
      t.compliance,
      t.prohibition,
      t.intendedUse,
      t.experimental,
      t.ethics,
      t.revocation
    ];
    
    // For summary variant, only show key sections
    const sections = variant === 'summary' 
      ? [t.compliance, t.prohibition, t.experimental]
      : allSections;
  
    return (
      <Box sx={styles.container}>
        <Typography variant="h4" component="h1" sx={styles.mainTitle}>
          {t.title}
        </Typography>
        
        {sections.map((section, index) => (
          <Box key={index} sx={styles.section}>
            <Typography variant="h6" component="h2" sx={styles.sectionTitle}>
              {section.title}
            </Typography>
            
            <Typography variant="body1" sx={styles.sectionText}>
              {section.text}
            </Typography>
            
            {index < sections.length - 1 && <Divider sx={styles.divider} />}
          </Box>
        ))}
      </Box>
    );
  }
  
  TermsAndConditions.propTypes = {
    variant: PropTypes.oneOf(['full', 'summary'])
  };
  
  export default TermsAndConditions;