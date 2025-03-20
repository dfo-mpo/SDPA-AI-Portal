/**
 * Application-wide constants and configuration.
 * Defines tool metadata, categories, and helper functions for
 * accessing tool information throughout the application.
 */

import {
  Eye,
  FileText,
  Brain,
  Lock,
  Calculator,
  Languages
} from 'lucide-react';
  

  export const TOOLS = {
    // Computer Vision Tools
    SCALE_AGEING: {
      id: 'scale-ageing',
      name: 'Scale Ageing',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/scale-ageing-banner.jpg',
      actionText: 'Upload Images'
    },
    FENCE_COUNTING: {
      id: 'fence-counting',
      name: 'Fence Counting',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video'
    },
    
    // Large Language Model Tools
    CSV_ANALYZER: {
      id: 'csv-analyzer',
      name: 'CSV/PDF Analyzer',
      category: 'Large Language Models',
      icon: FileText,
      backgroundImage: '/assets/csv-analyzer-banner.jpg',
      actionText: 'Upload File'
    },
    PDF_CHATBOT: {
      id: 'pdf-chatbot',
      name: 'PDF Chatbot',
      category: 'Large Language Models',
      icon: Brain,
      backgroundImage: '/assets/pdf-chatbot-banner.jpg',
      actionText: 'Upload Document'
    },
    PII_REDACTOR: {
      id: 'pii-redactor',
      name: 'PII Redactor',
      category: 'Large Language Models',
      icon: Lock,
      backgroundImage: '/assets/pii-redactor-banner.jpg',
      actionText: 'Upload Document'
    },
    SENSITIVITY_CALCULATOR: {
      id: 'sensitivity-calculator',
      name: 'Sensitivity Score Calculator',
      category: 'Large Language Models',
      icon: Calculator,
      backgroundImage: '/assets/sensitivity-calculator-banner.jpg',
      actionText: 'Upload Document'
    },
    FRENCH_TRANSLATION: {
      id: 'french-translation',
      name: 'French Translation',
      category: 'Large Language Models',
      icon: Languages,
      backgroundImage: '/assets/french-translation-banner.jpg',
      actionText: 'Upload Document'
    }
  };
  
  /**
   * Tool categories with their respective tools
   * Used for dropdown menus and navigation
   */
  export const TOOL_CATEGORIES = {
    'Computer Vision': [
      TOOLS.SCALE_AGEING,
      TOOLS.FENCE_COUNTING
    ],
    'Large Language Models': [
      TOOLS.CSV_ANALYZER,
      TOOLS.PDF_CHATBOT,
      TOOLS.PII_REDACTOR,
      TOOLS.SENSITIVITY_CALCULATOR,
      TOOLS.FRENCH_TRANSLATION
    ]
  };
  
  /**
   * Helper functions to work with tools
   */
  
  /**
   * Get a tool by its name
   * @param {string} name - The name of the tool
   * @returns {Object|undefined} The tool object or undefined if not found
   */
  export const getToolByName = (name) => {
    return Object.values(TOOLS).find(tool => tool.name === name);
  };
  
  /**
   * Get a tool by its ID
   * @param {string} id - The ID of the tool
   * @returns {Object|undefined} The tool object or undefined if not found
   */
  export const getToolById = (id) => {
    return Object.values(TOOLS).find(tool => tool.id === id);
  };