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
 * Note: For HTTP requests we use http://, and for WebSocket connections we'll use ws://.
 */
// const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = '/api';

export const processFenceCounting = async (file, settings = {}) => {
  const adaptedSettings = adaptFenceCountingSettings(settings);
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

export const analyzeCsvPdf = async (csvFile, pdfFile, settings = {}) => {
  const outputFormats = settings.outputFormats || { json: true };
  const selectedFormats = Object.entries(outputFormats)
    .filter(([_, enabled]) => enabled)
    .map(([format]) => format);
  
  if (selectedFormats.length === 0) {
    selectedFormats.push('json');
  }
  
  const result = { formats: {} };
  
  for (const format of selectedFormats) {
    const adaptedSettings = adaptCSVAnalyzerSettings({...settings, outputType: format});
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
        result.formats[format] = { blob: blob };
      }
    } catch (error) {
      console.error(`Error processing ${format} format:`, error);
    }
  }
  
  result.primaryFormat = selectedFormats[0];
  return result;
};

export const redactPII = async (file, settings = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  const adaptedSettings = adaptPIIRedactorSettings(settings); 
  for (const [key, value] of Object.entries(adaptedSettings)) {
    formData.append(key, value);
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/pii_redact/`, formData, {
      responseType: 'blob',
      timeout: 60000
    });
    return response.data;
  } catch (error) {
    console.error('Error in redactPII:', error);
    throw error;
  }
};

export const translateToFrench = async (file, settings = {}) => {
  const adaptedSettings = adaptFrenchTranslationSettings(settings);
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
    if (result && result.translation) {
      try {
        const parsedTranslation = JSON.parse(result.translation);
        return { translation: parsedTranslation.output };
      } catch (parseError) {
        console.error('Error parsing translation JSON:', parseError); 
        return result;
      }
    }
    return result;
  } catch (error) {
    console.error('Error in translateToFrench:', error);
    throw error;
  }
};
    
export const calculateSensitivityScore = async (file, settings = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  const adaptedSettings = adaptSensitivityScoreSettings(settings);
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
 */
export async function* askOpenAI(chatHistory, currentMessage, documentContent, settings = {}, isAuth) {
  const adaptedSettings = adaptPdfChatbotSettings(settings);
  
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
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
    isAuth: isAuth,
    // User-supplied key for non-default models; null for gpt-4o-mini
    api_key: adaptedSettings.api_key || null,
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