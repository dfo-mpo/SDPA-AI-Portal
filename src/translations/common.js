/**
 * Common UI Element Translations
 */

export const en = {
    buttons: {
      cancel: "Cancel",
      save: "Save",
      continue: "Continue",
      apply: "Apply",
      reset: "Reset",
      close: "Close",
      upload: "Upload",
      download: "Download",
      processing: "Processing...",
    },
    dialogs: {
      confirmation: "Confirmation",
      warning: "Warning",
      error: "Error"
    },
    validation: {
      required: "This field is required",
      invalid: "Invalid input"
    },
    notifications: {
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information"
    },
    navigation: {
      home: "Home",
      back: "Back",
      next: "Next",
      previous: "Previous"
    },
    loading: "Loading...",
    errorOccurred: "An error occurred",
    unavailable: "Temporarily unavailable while we make improvements",
    tryAgain: "Try Again",
    noData: "No data available"
  };
  
  export const fr = {
    buttons: {
      cancel: "Annuler",
      save: "Enregistrer",
      continue: "Continuer",
      apply: "Appliquer",
      reset: "Réinitialiser",
      close: "Fermer",
      upload: "Téléverser",
      download: "Télécharger",
      processing: "Traitement en cours...",
    },
    dialogs: {
      confirmation: "Confirmation",
      warning: "Avertissement",
      error: "Erreur"
    },
    validation: {
      required: "Ce champ est obligatoire",
      invalid: "Entrée non valide"
    },
    notifications: {
      success: "Succès",
      error: "Erreur",
      warning: "Avertissement",
      info: "Information"
    },
    navigation: {
      home: "Accueil",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent"
    },
    loading: "Chargement...",
    errorOccurred: "Une erreur s'est produite",
    unavailable: "Temporairement indisponible pendant que nous l'améliorons",
    tryAgain: "Réessayer",
    noData: "Aucune donnée disponible"
  };
  
  /**
   * Get common translations
   * 
   * @param {string} language - Language code ('en' or 'fr')
   * @returns {Object} - Translations object
   */
  export function getCommonTranslations(language) {
    return language === 'fr' ? fr : en;
  }