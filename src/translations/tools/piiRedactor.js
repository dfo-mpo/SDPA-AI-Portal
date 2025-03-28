/**
 * PII Redactor Tool Translations
 */

export const en = {
    title: "PII Redactor",
    shortDescription: "Automatically redact personal data from PDF documents.",
    longDescription: "This tool leverages Microsoft Presidio to detect and redact Personally Identifiable Information (PII) such as names, addresses, and phone numbers in PDF documents. It helps enhance data privacy by automatically censoring sensitive content.\n\nUpload a PDF or use a sample document to see the redaction process in action.",
    actionButtonText: "Upload PDF",
    ui: {
      processing: "Redacting personal information, please wait...",
      success: "Your document has been redacted",
      personalInfoRedacted: "Personal information has been redacted from your document. The following information types were processed:",
      redactionMethod: "Redaction method:",
      detectionSensitivity: "Detection sensitivity:",
      sensitivityLevels: {
        conservative: "Conservative",
        balanced: "Balanced",
        aggressive: "Aggressive"
      },
      processAnotherDocument: "Process Another Document",
      downloadRedactedPDF: "Download Redacted PDF"
    },
    settings: {
      redactionMethod: "Redaction Method",
      mask: "Mask with: ███",
      useTypeLabel: "Use [TYPE]",
      useTypeTooltip: "Replace redacted info with its type label (e.g., [NAME], [EMAIL])",
      redactionColorLabel: "Redaction Color",
      infoToRedact: "Information to Redact",
      infoTooltip: "Select which types of personal information should be identified and redacted from your document",
      detectionSensitivity: "Detection Sensitivity",
      detectionSensitivityTooltip: "Adjust how aggressively the system detects potential PII",
      sensitivityLow: "Conservative",
      sensitivityMedium: "Balanced",
      sensitivityHigh: "Aggressive",
      sensitivityDescription: "Conservative: Fewer false positives, might miss some PII. Aggressive: Catches more PII, might redact non-sensitive text.",
      categories: {
        PERSONAL_IDENTIFIERS: "Personal Identifiers",
        PERSONAL_IDENTIFIERS_DESC: "Names, SSNs, SINs, PRIs, passport numbers, and other personal IDs",
        CONTACT_INFO: "Contact Information",
        CONTACT_INFO_DESC: "Phone numbers, email addresses, physical addresses, postal codes",
        FINANCIAL_INFO: "Financial Information",
        FINANCIAL_INFO_DESC: "Credit cards, bank accounts, financial numbers, SINs",
        ORGANIZATIONAL_INFO: "Organizational Information",
        ORGANIZATIONAL_INFO_DESC: "Company names, business identifiers, department names",
        LOCATION_DATA: "Location Data",
        LOCATION_DATA_DESC: "Geographic locations, building names, addresses, postal codes"
      },
      redactorHelperText: "All redaction is performed locally in your browser. No sensitive data is sent to any server."
    }
  };
  
  export const fr = {
    title: "Rédacteur de PII",
    shortDescription: "Anonymisez automatiquement les données personnelles dans les PDF.",
    longDescription: "Cet outil utilise Microsoft Presidio pour détecter et masquer les informations personnelles identifiables (PII) telles que les noms, adresses et numéros de téléphone dans les fichiers PDF. Il contribue à renforcer la confidentialité des données en censurant automatiquement les informations sensibles.\n\nTéléversez un PDF ou utilisez un document d'exemple pour voir comment fonctionne l'anonymisation.",
    actionButtonText: "Téléverser un PDF",
    ui: {
      processing: "Anonymisation des informations personnelles, veuillez patienter...",
      success: "Votre document a été anonymisé",
      personalInfoRedacted: "Les informations personnelles ont été anonymisées dans votre document. Les types d'informations suivants ont été traités :",
      redactionMethod: "Méthode d'anonymisation :",
      detectionSensitivity: "Sensibilité de détection :",
      sensitivityLevels: {
        conservative: "Conservateur",
        balanced: "Équilibré",
        aggressive: "Agressif"
      },
      processAnotherDocument: "Traiter un autre document",
      downloadRedactedPDF: "Télécharger le PDF anonymisé"
    },
    settings: {
      redactionMethod: "Méthode d'anonymisation",
      mask: "Masquer avec: ███",
      useTypeLabel: "Utiliser [TYPE]",
      useTypeTooltip: "Remplace les informations anonymisées par leur type (ex: [NOM], [EMAIL])",
      redactionColorLabel: "Couleur d'anonymisation",
      infoToRedact: "Informations à anonymiser",
      infoTooltip: "Sélectionnez les types d'informations personnelles à identifier et anonymiser dans votre document",
      detectionSensitivity: "Sensibilité de détection",
      detectionSensitivityTooltip: "Ajustez la sensibilité avec laquelle le système détecte les PII potentielles",
      sensitivityLow: "Conservateur",
      sensitivityMedium: "Équilibré",
      sensitivityHigh: "Agressif",
      sensitivityDescription: "Conservateur : Moins de faux positifs, pourrait manquer certains PII. Agressif : Détecte plus de PII, pourrait anonymiser du texte non-sensible.",
      categories: {
        PERSONAL_IDENTIFIERS: "Identifiants Personnels",
        PERSONAL_IDENTIFIERS_DESC: "Noms, numéros d'assurance sociale, PRIs, numéros de passeport et autres ID personnels",
        CONTACT_INFO: "Informations de Contact",
        CONTACT_INFO_DESC: "Numéros de téléphone, adresses e-mail, adresses physiques, codes postaux",
        FINANCIAL_INFO: "Informations Financières",
        FINANCIAL_INFO_DESC: "Cartes de crédit, comptes bancaires, numéros financiers, NAS",
        ORGANIZATIONAL_INFO: "Informations Organisationnelles",
        ORGANIZATIONAL_INFO_DESC: "Noms d'entreprises, identifiants commerciaux, noms de départements",
        LOCATION_DATA: "Données de Localisation",
        LOCATION_DATA_DESC: "Localisations géographiques, noms de bâtiments, adresses, codes postaux"
      },
      redactorHelperText: "Toute l'anonymisation est effectuée localement dans votre navigateur. Aucune donnée sensible n'est envoyée à un serveur."
    }
  };