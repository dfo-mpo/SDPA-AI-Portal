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
  adaptSensitivityScoreSettings,
  adaptPIIRedactorSettings,
  adaptFrenchTranslationSettings,
  adaptFenceCountingSettings,
  adaptPdfChatbotSettings
} from '../utils/settingsAdapter';

/**
 * Base URL for the FastAPI backend.
 * Note: For HTTP requests we use http://, and for WebSocket connections we’ll use ws://.
 */
const API_BASE_URL = 'http://localhost:8080';
// const API_BASE_URL = '/api';

/**
 * Process a video for fish counting
 * Returns a processed video with fish counts
 * 
 * @param {File} file - The video file to process
 * @param {Object} settings - Settings for fish counting
 * @returns {Promise<Blob>} The processed video blob
 */
export const processFenceCounting = async (file, settings = {}) => {
  // Use the adapter to transform settings
  const adaptedSettings = adaptFenceCountingSettings(settings);
  const formData = new FormData();
  formData.append('file', file);
  
  // Currently no settings are added to formData since backend doesn't support them

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
 * Process a scale image for age estimation
 * Returns the age in the format "Age X" (e.g., "Age 5")
 * 
 * @param {File} file - The image file to process
 * @param {boolean} enhance - Whether to enhance the image
 * @param {string} species - The type of fish
 * @returns {Promise<Object>} The processing result with age property
 */
export const processScaleAge = async (file, settings = {}) => {
  const adaptedSettings = adaptScaleAgeingSettings(settings);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enhance', adaptedSettings.enhance.toString());
  formData.append('species', adaptedSettings.species);
  try {
    console.log("Sending species:", adaptedSettings.species);
    const response = await fetch(`${API_BASE_URL}/age_scale/`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res_json = await response.json();
    return {
      ...res_json,
      "filename": file.name
    };
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
      const response = await axios.post(
        `${API_BASE_URL}/openai_csv_analyze/?${params.toString()}`, 
        formData, 
        { responseType: 'blob' }
      );
      const blob = response.data;
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
export const translateToFrench = async (file, settings = {}) => {
  const adaptedSettings = adaptFrenchTranslationSettings(settings);
  const formData = new FormData();
  formData.append('file', file);
  // TODO:
  // In the future, when backend supports settings, add them to formData here
  // Currently, no settings are added since backend doesn't accept any
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
export const calculateSensitivityScore = async (file, settings = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Use the adapter to transform settings
  const adaptedSettings = adaptSensitivityScoreSettings(settings);
  
  // Add the adapted settings as JSON
  formData.append('settings', JSON.stringify(adaptedSettings));


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

export const processPdfDocument = async (files) => {
  const formData = new FormData();
  console.log(files)
  for(let i = 0; i < files.length; i ++) {
    formData.append(files.length > 1? 'files' : 'file', files[i]);
  }
  try {
    const response = await fetch(files.length > 1? `${API_BASE_URL}/di_chunk_multi_document/` : `${API_BASE_URL}/di_chunk_single_document/`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in processPdfDocument:', error);
    throw error;
  }
};

/**
 * Ask question to OpenAI with streaming response
 * 
 * @param {Array} chatHistory - Conversation history  
 * @param {String} documentContent - Extracted document text
 * @param {Object} settings - Settings for the chatbot
 * @returns {AsyncGenerator} A generator that yields response chunks
 */
export async function* askOpenAI(chatHistory, currentMessage, documentContent, settings = {}, isAuth) {
  // Use the adapter to transform settings
  const adaptedSettings = adaptPdfChatbotSettings(settings);
  
  // Determine the correct protocol based on the current page
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  // Build the endpoint URL using the current host and a relative path
  const wsUrl = `${protocol}://${window.location.host}/ws/chat_stream`;
  const socket = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  const payload = {
    chat_history: [...chatHistory, { role: 'user', content: currentMessage }],
    document_vectors: documentContent,
    model: adaptedSettings.model,
    temperature: adaptedSettings.temperature,
    reasoning_effort: adaptedSettings.reasoning_effort,
    token_limit: adaptedSettings.token_limit,
    isAuth: isAuth
  };

  socket.send(JSON.stringify(payload));

  const messageQueue = [];
  let finished = false;

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      messageQueue.push(data);
    } catch (e) {
      console.error("Error parsing websocket message", e);
    }
  };

  socket.onclose = () => { finished = true; };
  socket.onerror = (err) => {
    finished = true;
    console.error("WebSocket error", err);
  };

  while (!finished || messageQueue.length > 0) {
    if (messageQueue.length > 0) {
      yield messageQueue.shift();
    } else {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

/**
 * Predict cat vs dog using the already-built Custom Vision model
 * @param {File} imageFile - Image to classify
 * @param {string} modelId - Model type (e.g. cat vs dog, apple vs orange, ...)
 * @returns {Promise<{label: string|null, confidence: number, predictions: Array<{label: string, confidence: number}>}>}
 */
export const predictWithModel = async (modelId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/predict/${encodeURIComponent(modelId)}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Predict failed (${response.status}): ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in predictWithModel:", error);
    throw error;
  }
};

export const listClassificationModels = async () => {
  const res = await fetch(`${API_BASE_URL}/api/classificationmodels`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Models fetch failed (${res.status}): ${text}`);
  }
  return await res.json();
};