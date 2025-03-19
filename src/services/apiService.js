/**
 * API Service
 * 
 * Centralized API call functions for all tools.
 * Each function matches exactly the FastAPI backend endpoints.
 */

import axios from 'axios';

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
 * Redact PII from a document
 * Returns a streaming response with the redacted PDF
 * 
 * @param {File} file - The document file to redact
 * @returns {Promise<Blob>} The redacted document blob
 */
export const redactPII = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/pii_redact/`, formData, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in redactPII:', error);
    throw error;
  }
};

/**
 * Process a video for fence counting
 * Returns a streaming response with the processed video
 * 
 * @param {File} file - The video file to process
 * @returns {Promise<Blob>} The processed video blob
 */
export const processFenceCounting = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/fence_counting/`, formData, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in processFenceCounting:', error);
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
    
    return await response.json();
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