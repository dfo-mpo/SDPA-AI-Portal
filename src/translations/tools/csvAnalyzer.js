/**
 * CSV Analyzer Tool Translations
 */

export const en = {
    title: "CSV/PDF Analyzer",
    shortDescription: "Extract insights from documents using structured prompts.",
    longDescription: "This tool enables structured document analysis by processing CSV-based prompts against PDF files. Users can define specific questions or extraction tasks in a CSV file, and the tool will analyze the uploaded document accordingly.\n\nUpload a CSV file containing your prompts and a PDF document to get started. This tool is for demonstration purposes only - do not upload sensitive data.",
    actionButtonText: "Upload Files",
    ui: {
      howItWorks: "How It Works",
      step1Title: "1. Create CSV Prompts",
      step1Description: "Define your analysis questions in a CSV",
      step2Title: "2. Prepare PDF Document",
      step2Description: "Have your PDF document ready for analysis",
      step3Title: "3. Analyze Results",
      step3Description: "Get insights from your document based on your prompts",
      uploadFiles: "Upload Files",
      processNewFiles: "Process New Files",
      analyzeFiles: "Analyze Files",
      previous: "Previous",
      next: "Next"
    },
    modal: {
      title: "Upload Your Files",
      description: "Upload a CSV file with your analysis prompts and a PDF document to analyze.",
      csvPrompts: "CSV Prompts",
      pdfDocument: "PDF Document",
      csvUploadPrompt: "Click to upload your CSV file with prompts",
      csvFormatRequired: ".csv format required",
      pdfUploadPrompt: "Click to upload your PDF document",
      pdfFormatRequired: ".pdf format required"
    },
    results: {
      title: "Analysis Results",
      success: "Analysis completed successfully",
      pdfDocument: "PDF Document:",
      csvPrompts: "CSV Prompts:",
      processedOn: "Processed on:",
      jsonDataTitle: "Analysis Data (JSON):",
      textDataTitle: "Analysis Data (Text):",
      csvReadyMessage: "CSV file ready for download. Use the button below to save it."
    },
    settings: {
      aiModel: "AI Model",
      gpt4omini: "GPT-4o mini (default)",
      gpt4o: "GPT-4o",
      gpt35: "GPT-3.5",
      analysisType: "Analysis Type",
      summary: "Summary Overview",
      detailed: "Detailed analysis",
      comparison: "Comparative analysis",
      custom: "Custom prompt",
      outputOptions: "Output Options",
      outputOptionsTooltip: "Configure how you want the analysis results displayed. 'Show Document Sources' includes page numbers and paragraph references for each response.",
      showSources: "Show Document Sources",
      outputFormats: "Output Formats",
      outputFormatsTooltip: "Select one or more formats for the output",
      textOutput: "Text Output",
      csvOutput: "CSV Output",
      jsonOutput: "JSON Output",
      fileSizeNote: "Files larger than 10MB may take longer to process."
    },
    errors: {
      analyzing: "Failed to analyze files. Please check that your CSV and PDF are in the correct format and try again.",
      processing: "Analyzing files, please wait..."
    }
  };
  
  export const fr = {
    title: "Analyseur CSV/PDF",
    shortDescription: "Extraire des informations des documents à l'aide de requêtes structurées.",
    longDescription: "Cet outil permet l'analyse structurée des documents en traitant des requêtes basées sur des fichiers CSV appliquées aux fichiers PDF. Les utilisateurs peuvent définir des questions spécifiques ou des tâches d'extraction dans un fichier CSV, et l'outil analysera le document en conséquence.\n\nTéléversez un fichier CSV contenant vos requêtes et un document PDF pour commencer. Cet outil est destiné à des fins de démonstration uniquement - ne téléversez pas de données sensibles.",
    actionButtonText: "Téléverser des fichiers",
    ui: {
      howItWorks: "Comment ça marche",
      step1Title: "1. Créer des requêtes CSV",
      step1Description: "Définissez vos questions d'analyse dans un CSV",
      step2Title: "2. Préparer le document PDF",
      step2Description: "Ayez votre document PDF prêt pour l'analyse",
      step3Title: "3. Analyser les résultats",
      step3Description: "Obtenez des informations de votre document basées sur vos requêtes",
      uploadFiles: "Téléverser des fichiers",
      processNewFiles: "Traiter de nouveaux fichiers",
      analyzeFiles: "Analyser les fichiers",
      previous: "Précédent",
      next: "Suivant"
    },
    modal: {
      title: "Téléverser vos fichiers",
      description: "Téléversez un fichier CSV avec vos requêtes d'analyse et un document PDF à analyser.",
      csvPrompts: "Requêtes CSV",
      pdfDocument: "Document PDF",
      csvUploadPrompt: "Cliquez pour téléverser votre fichier CSV avec les requêtes",
      csvFormatRequired: "Format .csv requis",
      pdfUploadPrompt: "Cliquez pour téléverser votre document PDF",
      pdfFormatRequired: "Format .pdf requis"
    },
    results: {
      title: "Résultats d'analyse",
      success: "Analyse complétée avec succès",
      pdfDocument: "Document PDF :",
      csvPrompts: "Requêtes CSV :",
      processedOn: "Traité le :",
      jsonDataTitle: "Données d'analyse (JSON) :",
      textDataTitle: "Données d'analyse (Texte) :",
      csvReadyMessage: "Le fichier CSV est prêt à être téléchargé. Utilisez le bouton ci-dessous pour l'enregistrer."
    },
    settings: {
      aiModel: "Modèle d'IA",
      gpt4omini: "GPT-4o mini (par défaut)",
      gpt4o: "GPT-4o",
      gpt35: "GPT-3.5",
      analysisType: "Type d'analyse",
      summary: "Aperçu synthétique",
      detailed: "Analyse détaillée",
      comparison: "Analyse comparative",
      custom: "Requête personnalisée",
      outputOptions: "Options de sortie",
      outputOptionsTooltip: "Configurez l'affichage des résultats d'analyse. 'Afficher les sources du document' inclut les numéros de page et les références de paragraphe pour chaque réponse.",
      showSources: "Afficher les sources du document",
      outputFormats: "Formats de sortie",
      outputFormatsTooltip: "Sélectionnez un ou plusieurs formats pour les résultats",
      textOutput: "Sortie texte",
      csvOutput: "Sortie CSV",
      jsonOutput: "Sortie JSON",
      fileSizeNote: "Pour les fichiers volumineux, l'analyse détaillée peut prendre plus de temps."
    },
    errors: {
      analyzing: "Échec de l'analyse des fichiers. Veuillez vérifier que votre CSV et PDF sont au bon format et réessayez.",
      processing: "Analyse des fichiers en cours, veuillez patienter..."
    }
  };