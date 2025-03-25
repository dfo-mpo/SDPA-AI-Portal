/**
 * API Service
 * 
 * Centralized API call functions for all tools.
 * Each function matches exactly the FastAPI backend endpoints.
 */

import axios from 'axios';
import { 
  adaptCSVAnalyzerSettings, 
  adaptScaleAgeingSettings, 
  adaptSensitivityScoreSettings 
} from '../utils/settingsAdapter';

/**
 * Base URL for the FastAPI backend
 * All services are on port 8080
 */
const API_BASE_URL = 'http://localhost:8080';

/**
 * Process a scale image for age estimation
 * Returns the age in the format "Age X" (e.g., "Age 5")
 * 
 * @param {File} file - The image file to process
 * @param {boolean} enhance - Whether to enhance the image
 * @param {string} fishType - The type of fish
 * @returns {Promise<Object>} The processing result with age property
 */
export const processScaleAge = async (file, enhance = false, fishType = "Chum") => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enhance', enhance.toString());
  formData.append('fish_type', fishType);

  try {
    const response = await fetch(`${API_BASE_URL}/age_scale/`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in processScaleAge:', error);
    throw error;
  }
};

/**
 * Convert an image to PNG format
 * Returns a streaming response with the PNG file
 * 
 * @param {File} file - The image file to convert
 * @returns {Promise<Blob>} The PNG image blob
 */
export const convertToPng = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/to_png/`, formData, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in convertToPng:', error);
    throw error;
  }
};

/**
 * Analyze CSV prompts with a PDF document
 * Returns a streaming response with either JSON or CSV data
 * 
 * @param {File} csvFile - The CSV file with prompts
 * @param {File} pdfFile - The PDF document to analyze
 * @param {Object} settings - Settings for analysis
 * @returns {Promise<Object>} Object with formats containing data and blobs
 */
export const analyzeCsvPdf = async (csvFile, pdfFile, settings = {}) => {
  // Get selected output formats
  const outputFormats = settings.outputFormats || { json: true };
  const selectedFormats = Object.entries(outputFormats)
    .filter(([_, enabled]) => enabled)
    .map(([format]) => format);
  
  // Default to JSON if somehow nothing is selected
  if (selectedFormats.length === 0) {
    selectedFormats.push('json');
  }
  
  // Create a result object to store outputs in different formats
  const result = { formats: {} };
  
  // Process each selected format
  for (const format of selectedFormats) {
    // Adapt settings for the current format
    const adaptedSettings = adaptCSVAnalyzerSettings({...settings, outputType: format});
    
    // Create a new FormData for each request since we can't reuse it
    const formData = new FormData();
    formData.append('csv_file', csvFile); 
    formData.append('pdf_file', pdfFile);
    
    try {
      console.log(`Processing ${format} format...`);
      
      const params = new URLSearchParams();
      if (adaptedSettings.outputType) {
        params.append('outputType', adaptedSettings.outputType);
      }
      // Add other params as they become available in adaptedSettings

      // Make the API call for this format
      const response = await axios.post(
        `${API_BASE_URL}/openai_csv_analyze/?${params.toString()}`, 
        formData, 
        { responseType: 'blob' }
      );
      
      const blob = response.data;
      
      // Process the response based on format
      if (format === 'json') {
        const text = await blob.text();
        try {
          const jsonData = JSON.parse(text);
          result.formats.json = {
            data: jsonData,
            blob: new Blob([text], { type: 'application/json' })
          };
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          result.formats.json = { blob: blob };
        }
      } else if (format === 'text') {
        const text = await blob.text();
        result.formats.text = {
          data: text,
          blob: new Blob([text], { type: 'text/plain' })
        };
      } else {
        // For CSV or other formats, just store the blob
        result.formats[format] = { blob: blob };
      }
    } catch (error) {
      console.error(`Error processing ${format} format:`, error);
      // Continue with other formats even if one fails
    }
  }
  
  // Set the primary format (first selected format)
  result.primaryFormat = selectedFormats[0];
  
  return result;
};

/**
 * Enhanced redactPII function for API Service
 * This updated implementation handles Canadian-specific information and ensures
 * redactions are completely opaque.
 * 
 * @param {File} file - The document file to redact
 * @param {Object} settings - Optional settings for redaction
 * @returns {Promise<Blob>} The redacted document blob
 */
export const redactPII = async (file, settings = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Redaction settings:', settings); // Debug log
  
  // Add redaction method setting
  if (settings.redactionMethod) {
    formData.append('redaction_method', settings.redactionMethod);
    console.log('Using redaction method:', settings.redactionMethod);
    
    // If using mask method, include the color
    if (settings.redactionMethod === 'mask' && settings.redactionColor) {
      // Convert hex color to RGB format expected by backend
      const hexToRgb = (hex) => {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
      };
      
      const rgbColor = hexToRgb(settings.redactionColor);
      const colorString = rgbColor.join(',');
      formData.append('redaction_color', colorString);
      console.log('Using redaction color:', settings.redactionColor, '->', colorString);
    }
  }
  
  // Add detection sensitivity if provided
  if (settings.detectionSensitivity !== undefined) {
    formData.append('detection_sensitivity', settings.detectionSensitivity);
    console.log('Using detection sensitivity:', settings.detectionSensitivity);
  }
  
  // Add category information if present
  if (settings.categories) {
    // Convert the categories object to a JSON string
    const categoriesJson = JSON.stringify(settings.categories);
    formData.append('categories', categoriesJson);
    console.log('Using categories:', categoriesJson);
    
    // Map to specific entity types the backend can understand
    const enabledEntities = [];
    for (const [category, info] of Object.entries(settings.categories)) {
      if (info.enabled) {
        // Enhanced mapping with Canadian-specific types
        switch (category) {
          case 'PERSONAL_IDENTIFIERS':
            enabledEntities.push('PERSON', 'US_SSN', 'GOVERNMENT_ID', 'CA_SIN', 'CA_PRI');
            break;
          case 'CONTACT_INFO':
            enabledEntities.push('PHONE_NUMBER', 'EMAIL_ADDRESS', 'ADDRESS', 'CA_POSTAL_CODE', 'CA_ADDRESS_COMPONENT');
            break;
          case 'FINANCIAL_INFO':
            enabledEntities.push('CREDIT_CARD', 'FINANCIAL_ID', 'CA_SIN');
            break;
          case 'ORGANIZATIONAL_INFO':
            enabledEntities.push('ORGANIZATION');
            break;
          case 'LOCATION_DATA':
            enabledEntities.push('LOCATION', 'CA_POSTAL_CODE', 'CA_ADDRESS_COMPONENT');
            break;
        }
      }
    }
    
    if (enabledEntities.length > 0) {
      formData.append('entities_to_redact', enabledEntities.join(','));
      console.log('Mapped to entity types:', enabledEntities.join(','));
    }
  }
  // For backward compatibility, handle old entities format
  else if (settings.entities) {
    // Map old entity names to new backend entity types
    const entityMapping = {
      'PERSON': 'PERSON',
      'EMAIL_ADDRESS': 'EMAIL_ADDRESS',
      'PHONE_NUMBER': 'PHONE_NUMBER',
      'ADDRESS': ['ADDRESS', 'CA_ADDRESS_COMPONENT'],
      'SIN': 'CA_SIN',
      'CREDIT_CARD': 'CREDIT_CARD',
      'CA_POSTAL_CODE': 'CA_POSTAL_CODE',
      'CA_PRI': 'CA_PRI'
    };
    
    const enabledEntities = [];
    
    // Go through each entity in the settings
    Object.keys(settings.entities)
      .filter(key => settings.entities[key])
      .forEach(key => {
        // Get the mapping for this entity type
        const mapping = entityMapping[key];
        
        // If the mapping is an array, add all values
        if (Array.isArray(mapping)) {
          enabledEntities.push(...mapping);
        } 
        // Otherwise add the single value if it exists
        else if (mapping) {
          enabledEntities.push(mapping);
        }
      });
    
    // Remove duplicates
    const uniqueEntities = [...new Set(enabledEntities)].join(',');
    
    if (uniqueEntities) {
      formData.append('entities_to_redact', uniqueEntities);
      console.log('Using entity types:', uniqueEntities);
    }
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/pii_redact/`, formData, {
      responseType: 'blob',
      timeout: 60000 // 60 second timeout for processing larger documents
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in redactPII:', error);
    throw error;
  }
};

/**
 * Translate a PDF document to French
 * Returns JSON with a "translation" property containing the translated text
 * 
 * @param {File} file - The PDF file to translate
 * @returns {Promise<Object>} Object with translation property
 */
export const translateToFrench = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/pdf_to_french/`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the nested JSON structure that comes from the backend
    if (result && result.translation) {
      try {
        // Parse the stringified JSON in the translation field
        const parsedTranslation = JSON.parse(result.translation);
        // Return a clean object with just the translated text
        return {
          translation: parsedTranslation.output
        };
      } catch (parseError) {
        console.error('Error parsing translation JSON:', parseError);
        return result; // Return original result if parsing fails
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in translateToFrench:', error);
    throw error;
  }
};
    
/**
 * Calculate sensitivity score for a document
 * Returns JSON with a "sensitivity_score" property
 * Includes optional categoryWeights parameter to customize weight distribution
 * 
 * @param {File} file - The document file to analyze
 * @param {Object} settings - Settings for sensitivity score calculation
 * @returns {Promise<Object>} Object with sensitivity_score property
 */
export const calculateSensitivityScore = async (file, settings) => {
  const formData = new FormData();
  formData.append('file', file);

  // If we have settings, add them to the request
  if (settings) {
    // TODO: add customized weights extension
    // backend currently doesn't support customizing entity weights via API.
    // preparing for future extension.
    formData.append('settings', JSON.stringify(settings));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sensitivity_score/`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in calculateSensitivityScore:', error);
    throw error;
  }
};