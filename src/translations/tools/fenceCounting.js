/**
 * Fence Counting Tool Translations
 */

export const en = {
    title: "Fence Counting",
    shortDescription: "AI-powered fish counting from river monitoring videos.",
    longDescription: "This tool uses computer vision to analyze each frame of river monitoring videos, detecting and classifying salmon as they pass through counting fences. The AI model helps automate species identification and improves accuracy in population tracking.\n\nUpload a video to get started. This tool is for demonstration purposes only - do not upload sensitive data.",
    actionButtonText: "Upload Video",
    ui: {
      uploadVideo: "Upload Video",
      uploadDisabled: "Upload functionality is temporarily disabled",
      sampleTitle: "Sample Videos",
      sampleSubtitle: "Select a sample to see the tool in action",
      viewResults: "Use This Video",
      processing: "Processing...",
      tryAgain: "Try Another Video",
      resultsHeading: "Fish Detection Results",
      resultsDescription: "Fish detected and counted",
      resultsNote: "See video for detailed counts and tracking",
      source: "Source",
      originalVideo: "Original Video",
      processedVideo: "Processed Video with Fish Count",
      processingMessage: "Analyzing video frames and tracking fish. This may take a few moments."

    },
    settings: {
      speciesLabel: "Species to Count",
      all: "All Species",
      sockeye: "Sockeye",
      chum: "Chum",
      chinook: "Chinook",
      coho: "Coho",
      pink: "Pink",
      directionLabel: "Count Direction",
      both: "Both Directions",
      upstream: "Upstream Only",
      downstream: "Downstream Only",
      trackObjects: "Track Individual Fish",
      trackObjectsTooltip: "Enable to track individual fish across frames to avoid double-counting",
      modelInfo: "Current model is optimized for good visibility conditions. Processing may take longer for longer videos."
    },
    sample: {
      chinook: "Sample showing Chinook salmon passing through a counting fence",
      sockeye: "Sample showing Sockeye salmon migration"
    }
  };
  
  export const fr = {
    title: "Comptage des barrières",
    shortDescription: "Comptage des poissons à l'aide de vidéos de surveillance des rivières.",
    longDescription: "Cet outil utilise la vision par ordinateur pour analyser chaque image des vidéos de surveillance des rivières, détectant et classifiant les saumons lorsqu'ils passent par des barrières de comptage. Le modèle d'IA aide à automatiser l'identification des espèces et améliore la précision du suivi des populations.\n\nTéléversez une vidéo pour commencer. Cet outil est destiné à des fins de démonstration uniquement - ne téléversez pas de données sensibles.",
    actionButtonText: "Téléverser une vidéo",
    ui: {
      uploadVideo: "Téléverser une vidéo",
      uploadDisabled: "La fonctionnalité de téléchargement est temporairement désactivée",
      sampleTitle: "Vidéos d'exemple",
      sampleSubtitle: "Sélectionnez un exemple pour voir l'outil en action",
      viewResults: "Utiliser cette vidéo",
      processing: "Traitement en cours...",
      tryAgain: "Essayer une autre vidéo",
      resultsHeading: "Résultats de détection de poissons",
      resultsDescription: "Poissons détectés et comptés",
      resultsNote: "Voir la vidéo pour les comptages détaillés et le suivi",
      source: "Source",
      originalVideo: "Vidéo originale",
      processedVideo: "Vidéo traitée avec comptage de poissons",
      processingMessage: "Analyse des images vidéo et suivi des poissons. Cela peut prendre quelques instants."
    },
    settings: {
      speciesLabel: "Espèces à compter",
      all: "Toutes les espèces",
      sockeye: "Saumon rouge",
      chum: "Saumon kéta",
      chinook: "Saumon chinook",
      coho: "Saumon coho",
      pink: "Saumon rose",
      directionLabel: "Direction du comptage",
      both: "Les deux directions",
      upstream: "En amont uniquement",
      downstream: "En aval uniquement",
      trackObjects: "Suivre les poissons individuellement",
      trackObjectsTooltip: "Activez cette option pour suivre les poissons individuellement et éviter les doubles comptages",
      modelInfo: "Le modèle actuel est optimisé pour de bonnes conditions de visibilité. Le traitement peut prendre plus de temps pour les vidéos plus longues."
    },
    sample: {
      chinook: "Exemple montrant des saumons chinook passant par une barrière de comptage",
      sockeye: "Exemple montrant la migration du saumon rouge"
    }
  };