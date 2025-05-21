/**
 * Scale Ageing Tool Translations
 */

export const en = {
    title: "Scale Ageing",
    shortDescription: "AI-powered fish ageing from scale images.",
    longDescription: "This tool uses a computer vision model trained on annotated salmon scale images to estimate fish age with high accuracy. It automates ageing for fisheries research and management.\n\nUpload an image to get started. This tool is for demonstration purposes only - do not upload sensitive data.",
    actionButtonText: "Upload Scale Image",
    results: {
      estimatedAge: "Estimated Fish Age: {age}",
      species: "Species: {type}",
      enhanced: "Enhanced?: {value}",
      placeholder: "Placeholder?: {value}",
      yes: "Yes",
      no: "No"
    },
    settings: {
      speciesLabel: "Salmon Species",
      enhanceLabel: "Enhance Image Quality",
      enhanceTooltip: "Automatically adjusts contrast and clarity to better reveal annuli rings in the scale image.",
      modelInfo: "Current model is trained on North Pacific Chum salmon scales. More species coming soon.",
      chum: "Chum Salmon",
      coho: "Coho Salmon (Coming Soon)",
      chinook: "Chinook Salmon (Coming Soon)",
      sockeye: "Sockeye Salmon (Coming Soon)",
      pink: "Pink Salmon (Coming Soon)"
    },
    errors: {
      processing: "An error occurred while processing the image: {message}"
    }
  };
  
  export const fr = {
    title: "Âge des écailles",
    shortDescription: "Estimation de l'âge des poissons à partir d'images d'écailles.",
    longDescription: "Cet outil utilise un modèle de vision par ordinateur entraîné sur des images annotées d'écailles de saumon pour estimer leur âge avec une grande précision. Il automatise le vieillissement pour la recherche et la gestion des pêches.\n\nTéléversez une image d'écaille pour commencer. Cet outil est destiné à des fins de démonstration uniquement - ne téléversez pas de données sensibles.",
    actionButtonText: "Téléverser une image d'écaille",
    results: {
      estimatedAge: "Âge estimé du poisson : {age}",
      species: "Espèce : {type}",
      enhanced: "Amélioré ? : {value}",
      placeholder: "Placeholder ? : {value}",
      yes: "Oui",
      no: "Non"
    },
    settings: {
      speciesLabel: "Espèce de saumon",
      enhanceLabel: "Améliorer la qualité de l'image",
      enhanceTooltip: "Ajuste automatiquement le contraste et la clarté pour mieux révéler les anneaux annuli sur l'image de l'écaille.",
      modelInfo: "Le modèle actuel est entraîné sur des écailles de saumon kéta du Pacifique Nord. D'autres espèces seront ajoutées prochainement.",
      chum: "Saumon kéta",
      coho: "Saumon coho (Bientôt disponible)",
      chinook: "Saumon chinook (Bientôt disponible)",
      sockeye: "Saumon rouge (Bientôt disponible)",
      pink: "Saumon rose (Bientôt disponible)"
    },
    errors: {
      processing: "Une erreur s'est produite lors du traitement de l'image : {message}"
    }
  };