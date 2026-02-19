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
  Languages,
  FileSearch,
  ClipboardList,
  Store,
  BrainCircuit 
} from 'lucide-react';
  

  /**
   * Tool Configuration Parameters
   * @property {string} id - Unique identifier used for routing and internal references.
   * @property {string} name - Display name of the tool.
   * @property {string} category - Logical grouping for display and filtering.
   * @property {JSX.Element} icon - Icon component used in UI.
   * @property {string} backgroundImage - Path to background/banner image.
   * @property {string} actionText - Text displayed on the action button.
   * @property {boolean} [disabled=true] - (Optional) Whether the tool is disabled.
   * @property {string} [externalUrl] - (Optional) External URL to open instead of internal routing.
   * @property {boolean} [showInDropdown=false] - (Optional) Controls whether the tool appears in dropdown menu and tool settings.
   * @property {boolean} [showInDemo=false] - (Optional) Controls whether the tool appears on side menu in the demo version.
   */
  export const TOOLS = {
    // Computer Vision Tools
    SCALE_AGEING: {
      id: 'scale-ageing',
      name: 'Scale Ageing',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/scale-ageing-banner.jpg',
      actionText: 'Upload Images',
      showInDemo:false
    },
    FENCE_COUNTING: {
      id: 'fence-counting',
      name: 'Fence Counting',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video',
      showInDemo:false
    },
    Electronic_Monitoring: {
      id: 'electronic-monitoring',
      name: 'Electronic Monitoring',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video'
    },
    Underwater_Marine_Life_Annotation: {
      id: 'underwater-marine-life-annotation',
      name: 'Underwater Marine Life Annotation',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video'
    },
    Fish_Population_Estimation: {
      id: 'fish-population-estimation',
      name: 'Fish Population Estimation',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video'
    },
    Dectection_of_Ghost_Gear: {
      id: 'dectection-ghost-gear',
      name: 'Detection of Ghost Gear',
      category: 'Computer Vision',
      icon: Eye,
      backgroundImage: '/assets/fence-counting-banner.jpg',
      actionText: 'Upload Video'
    },
    CTD_Data_Quality_Control: {
      id: 'dq-control',
      name: 'CTD Data Quality Control',
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
      actionText: 'Upload File',
      showInDemo:false
    },
    PDF_CHATBOT: {
      id: 'pdf-chatbot',
      name: 'PDF Chatbot',
      category: 'Large Language Models',
      icon: Brain,
      backgroundImage: '/assets/pdf-chatbot-banner.jpg',
      actionText: 'Upload Document',
      showInDemo:false
    },
    PII_REDACTOR: {
      id: 'pii-redactor',
      name: 'PII Redactor',
      category: 'Large Language Models',
      icon: Lock,
      backgroundImage: '/assets/pii-redactor-banner.jpg',
      actionText: 'Upload Document'
      // disabled: true
    },
    SENSITIVITY_CALCULATOR: {
      id: 'sensitivity-calculator',
      name: 'Sensitivity Score Calculator',
      category: 'Large Language Models',
      icon: Calculator,
      backgroundImage: '/assets/sensitivity-calculator-banner.jpg',
      actionText: 'Upload Document'
      // disabled: true
    },
    FRENCH_TRANSLATION: {
      id: 'french-translation',
      name: 'French Translation',
      category: 'Large Language Models',
      icon: Languages,
      backgroundImage: '/assets/french-translation-banner.jpg',
      actionText: 'Upload Document',
      showInDemo:false
    },

    WEBSCRAPE: {
      id: 'webscrape',
      name: 'Web Scraper',
      category: 'Large Language Models',
      icon: FileSearch,
      backgroundImage: '/assets/OCR.gif',
      actionText: 'Scrape Website',
      showInDemo:false
    },

    CLASSIFICATIONMODEL: {
      id: 'classificationmodel',
      name: 'Classification Model',
      category: 'Large Language Models',
      icon: Brain,
      backgroundImage: '/assets/OCR.gif',
      actionText: 'Create a Classification Model',
      showInDemo:false,
      disabled:true
    },

    // Optical Character Recognition Tools
    DOCUMENT_OCR: {
      id: 'document-ocr',
      name: 'Document OCR',
      category: 'Optical Character Recognition',
      icon: FileSearch,
      backgroundImage: '/assets/OCR.gif',
      actionText: 'Upload Document',
      showInDemo:false
    },
    ML_MODELS: {
      id: 'ml-tools',
      name: 'Models',
      category: 'Model Repo',
      icon: BrainCircuit,
      backgroundImage: '/assets/csv-analyzer-banner.jpg',
      actionText: 'Coming Soon',
      disabled: false
    },
    DATA_INTAKE_FORM: {
      id: 'data-intake-form',
      name: 'Form',
      category: 'AI Inventory Form',
      icon: ClipboardList,
      backgroundImage: '/assets/clipboard.gif',
      actionText: 'Open Form',
      // showInDropdown: false
    },
    DOCX_EDITOR: {
      id: 'docx-editor',
      name: 'Document',
      category: 'Statistical and ML Algorithms Guide',
      icon: ClipboardList,
      backgroundImage: '/assets/clipboard.gif',
      actionText: 'Open Document',
      // showInDropdown: false
    },
    AI_RESOURCES: {
      id: 'ai-resources',
      name: 'Models, APIs, Tools and Services',
      category: 'AI Resources',
      icon: Store,
      backgroundImage: '/assets/csv-analyzer-banner.jpg',
      actionText: 'Coming Soon',
      disabled: true
    },

    OBJECT_MODEL_DETECTION: {
      id: 'object-model-detection',
      name: "Object Model Detection",
      category: 'Test',
      icon: Eye, 
      backgroundImage: '/assets/website-banner.jpg',
      actionText: 'Open Website',
      disabled: true,
      showInDemo: false
    },

    
  };
  
  /**
   * Tool categories with their respective tools
   * Used for dropdown menus and navigation
   */
  export const TOOL_CATEGORIES = {
    'Computer Vision': [
      TOOLS.SCALE_AGEING,
      TOOLS.FENCE_COUNTING,
      TOOLS.Electronic_Monitoring,
      TOOLS.Underwater_Marine_Life_Annotation,
      TOOLS.Fish_Population_Estimation,
      TOOLS.Dectection_of_Ghost_Gear,
      TOOLS.CTD_Data_Quality_Control
    ],
    'Large Language Models': [
      TOOLS.CSV_ANALYZER,
      TOOLS.PDF_CHATBOT,
      TOOLS.PII_REDACTOR,
      TOOLS.SENSITIVITY_CALCULATOR,
      TOOLS.FRENCH_TRANSLATION,
      TOOLS.WEBSCRAPE,
      TOOLS.CLASSIFICATIONMODEL
    ],
    'Optical Character Recognition': [
      TOOLS.DOCUMENT_OCR
    ],
    'Model Repo': [
      TOOLS.ML_MODELS,
    ],
    'AI Inventory Form': [
      TOOLS.DATA_INTAKE_FORM,
    ],
    'Statistical and ML Algorithms Guide': [
      TOOLS.DOCX_EDITOR,
    ],
    'AI Resources': [
      TOOLS.AI_RESOURCES,
    ],
    'Test': [
      TOOLS.OBJECT_MODEL_DETECTION,
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
