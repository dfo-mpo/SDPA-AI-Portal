/**
 * Banner Component
 * 
 * Reusable component for page headers and promotional banners.
 * Creates a visually appealing header with background image, title,
 * and description. Supports various display styles through the variant prop.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';


/**
 * Banner component for page headers
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The banner title
 * @param {string} props.description - The banner description text
 * @param {string} [props.backgroundImage='/assets/default-banner.jpg'] - URL for the background image
 * @param {string} [props.variant='default'] - Visual variant ('default', 'hero', or 'tool')
 * @param {React.ReactNode} [props.children] - Optional content to render inside the banner
 * @returns {JSX.Element} The rendered banner component
 */
export default function Banner({
  title,
  description,
  backgroundImage = '/assets/default-banner.jpg',
  variant = 'default',
  children
}) {
  // Get banner styles from our component styles hook
  const bannerStyles = useComponentStyles('banner');
  
  // Determine container style based on variant
  const containerStyle = variant === 'hero' ? bannerStyles.heroContainer : bannerStyles.container;
  
  // Determine title style based on variant
  const titleStyle = variant === 'hero' ? bannerStyles.heroTitle : bannerStyles.title;

  return (
    <Box sx={{
      ...containerStyle,
      backgroundImage: `url(${backgroundImage})`,
      '&::before': bannerStyles.gradient,
    }}>
      <Box sx={bannerStyles.content}>
        <Typography variant="h4" sx={titleStyle}>
          {title}
        </Typography>
        
        <Typography variant="body1" sx={bannerStyles.description}>
          {description}
        </Typography>
        
        {children}
      </Box>
    </Box>
  );
}

Banner.propTypes = {
  /** The banner title displayed prominently */
  title: PropTypes.string.isRequired,
  
  /** The banner description text */
  description: PropTypes.string.isRequired,
  
  /** URL for the background image */
  backgroundImage: PropTypes.string,
  
  /** Visual variant */
  variant: PropTypes.oneOf(['default', 'hero', 'tool']),
  
  /** Optional content to render inside the banner */
  children: PropTypes.node
};