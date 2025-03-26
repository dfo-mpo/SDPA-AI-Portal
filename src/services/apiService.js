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
  adaptSensitivityScoreSettings ,
  adaptPIIRedactorSettings
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
export const processScaleAge = async (file, settings = {}) => {
  const adaptedSettings = adaptScaleAgeingSettings(settings);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enhance', adaptedSettings.enhance.toString());
  formData.append('fish_type', adaptedSettings.fish);

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
  
  // Use the adapter to transform settings for current backend
  const adaptedSettings = adaptPIIRedactorSettings(settings); 
  
  // Add all adapted settings to formData
  for (const [key, value] of Object.entries(adaptedSettings)) {
    formData.append(key, value);
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