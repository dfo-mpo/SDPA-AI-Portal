/**
 * Custom hook for accessing component styles with proper theme context.
 * This hook provides consistent access to styles across the application
 * and handles theme-dependent styling automatically.
 */

import { useTheme } from '@mui/material/styles';
import componentStyles from '../componentStyles'

const useComponentStyles = (componentKey, props = {}) => {
  const theme = useTheme();
  
  // Get the style collection for the component
  const styleCollection = componentStyles[componentKey];
  
  if (!styleCollection) {
    console.warn(`No styles found for component key: ${componentKey}`);
    return {};
  }
  
  // Process each style object in the collection
  const processedStyles = {};
  
  Object.entries(styleCollection).forEach(([styleName, styleValue]) => {
    if (typeof styleValue === 'function') {
      processedStyles[styleName] = styleValue(theme, props);
    } else {
      processedStyles[styleName] = styleValue;
    }
  });
  
  return processedStyles;
};

export { useComponentStyles };
// export default useComponentStyles;