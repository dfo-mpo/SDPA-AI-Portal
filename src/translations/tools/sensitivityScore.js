/**
 * Sensitivity Score Calculator Tool Translations
 */

export const en = {
    title: "Sensitivity Score Calculator",
    shortDescription: "Check the sensitivity score of an uploaded document.",
    longDescription: "This tool uses Microsoft Presidio to analyze documents and determine their sensitivity score based on the presence of Personally Identifiable Information (PII). The higher the score, the more likely a document contains sensitive information.\n\nUpload a PDF document to get started. **These samples are for demonstration purposes only—do not upload sensitive data.**",
    actionButtonText: "Upload PDF",
    ui: {
      resultTitle: "Sensitivity Analysis Result",
      scoreDescriptions: {
        low: "Low sensitivity: This document contains minimal sensitive information.",
        medium: "Medium sensitivity: This document contains some sensitive information that may require protection.",
        high: "High sensitivity: This document contains significant sensitive information. Handle with care.",
        veryHigh: "Very high sensitivity: This document contains critical sensitive information and should be handled with strict confidentiality protocols."
      }
    },
    settings: {
      checkLabel: "Check for Sensitivity in:",
      checkTooltip: "Select what types of sensitive information should be evaluated",
      categories: {
        personalInfo: "Personal Information",
        businessInfo: "Business Information",
        scientificData: "Scientific Data",
        locationData: "Location Data"
      },
      autoFlagLabel: "Auto-flag sensitive documents",
      autoFlagTooltip: "Automatically flag documents that exceed the sensitivity threshold",
      advancedSettings: "Show Advanced Settings",
      hideAdvancedSettings: "Hide Advanced Settings",
      weightsLabel: "Category Weightings",
      weightsTooltip: "Adjust how much each category contributes to the overall sensitivity score (total must equal 100%)",
      resetButton: "Reset Weights",
      total: "Total:",
      weightError: "Weights must add up to exactly 100%",
      weightSum: "Weights add up to {totalWeight}%, must be exactly 100%",
      validation: {
        formInvalid: "Please ensure category weights add up to exactly 100% before uploading a document.",
        noUpload: "You won't be able to upload a document until the weights total exactly 100%."
      }
    }
  };
  
  export const fr = {
    title: "Calculateur de score de sensibilité",
    shortDescription: "Vérifiez le score de sensibilité d'un document téléchargé.",
    longDescription: "Cet outil utilise Microsoft Presidio pour analyser les documents et déterminer leur score de sensibilité en fonction de la présence d'informations personnelles identifiables (PII). Plus le score est élevé, plus le document est susceptible de contenir des données sensibles.\n\nTéléversez un document PDF pour commencer. **Ces exemples sont destinés à des fins de démonstration uniquement—ne téléversez pas de données sensibles.**",
    actionButtonText: "Téléverser un PDF",
    ui: {
      resultTitle: "Résultat d'analyse de sensibilité",
      scoreDescriptions: {
        low: "Faible sensibilité : Ce document contient un minimum d'informations sensibles.",
        medium: "Sensibilité moyenne : Ce document contient des informations sensibles qui peuvent nécessiter une protection.",
        high: "Haute sensibilité : Ce document contient des informations sensibles importantes. À manipuler avec précaution.",
        veryHigh: "Très haute sensibilité : Ce document contient des informations sensibles critiques et doit être traité avec des protocoles de confidentialité stricts."
      }
    },
    settings: {
      checkLabel: "Vérifier la sensibilité dans :",
      checkTooltip: "Sélectionnez les types d'informations sensibles à évaluer",
      categories: {
        personalInfo: "Informations personnelles",
        businessInfo: "Informations commerciales",
        scientificData: "Données scientifiques",
        locationData: "Données de localisation"
      },
      autoFlagLabel: "Signaler automatiquement les documents sensibles",
      autoFlagTooltip: "Signaler automatiquement les documents qui dépassent le seuil de sensibilité",
      advancedSettings: "Afficher les paramètres avancés",
      hideAdvancedSettings: "Masquer les paramètres avancés",
      weightsLabel: "Pondération des catégories",
      weightsTooltip: "Ajustez l'importance de chaque catégorie dans le score global (le total doit être de 100%)",
      resetButton: "Réinitialiser les pondérations",
      total: "Total :",
      weightError: "Les pondérations doivent totaliser exactement 100%",
      weightSum: "Les poids s'additionnent à {totalWeight}%, ils doivent être exactement 100%",
      validation: {
        formInvalid: "Veuillez vous assurer que les poids des catégories totalisent exactement 100% avant de téléverser un document.",
        noUpload: "Vous ne pourrez pas téléverser un document tant que les poids ne totaliseront pas exactement 100%."
      }
    }
  };