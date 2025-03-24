
export const toolTranslations = {
  scaleAgeing: {
    en: {
      title: "Scale Ageing",
      shortDescription: "AI-powered fish ageing from scale images.",
      longDescription: "This tool uses a computer vision model trained on annotated salmon scale images to estimate fish age with high accuracy. It automates ageing for fisheries research and management.\n\nUpload an image to get started. **This tool is for demonstration purposes only—do not upload sensitive data.**",
      actionButtonText: "Upload Scale Image",
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
      }
    },
    fr: {
      title: "Âge des écailles",
      shortDescription: "Estimation de l'âge des poissons à partir d'images d'écailles.",
      longDescription: "Cet outil utilise un modèle de vision par ordinateur entraîné sur des images annotées d'écailles de saumon pour estimer leur âge avec une grande précision. Il automatise le vieillissement pour la recherche et la gestion des pêches.\n\nTéléversez une image d'écaille pour commencer. **Cet outil est destiné à des fins de démonstration uniquement—ne téléversez pas de données sensibles.**",
      actionButtonText: "Téléverser une image d'écaille",
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
      }
    }
    },
    fenceCounting: {
    en: {
      title: "Fence Counting",
      shortDescription: "AI-powered fish counting from river monitoring videos.",
          longDescription: "This tool uses computer vision to analyze each frame of river monitoring videos, detecting and classifying salmon as they pass through counting fences. The AI model helps automate species identification and improves accuracy in population tracking.\n\nUpload a video to get started. **This tool is for demonstration purposes only—do not upload sensitive data.**",
          actionButtonText: "Upload Video",
          settings: {
            speciesLabel: "Species to Count",
            all: "All Species",
            sockeye: "Sockeye Only",
            chum: "Chum Only",
            chinook: "Chinook Only",
            coho: "Coho Only",
            pink: "Pink Only",
            directionLabel: "Count Direction",
            both: "Both Directions",
            upstream: "Upstream Only",
            downstream: "Downstream Only",
            trackObjects: "Track Individual Fish",
            trackObjectsTooltip: "Enable to track individual fish across frames to avoid double-counting",
            modelInfo: "Current model is optimized for good visibility conditions. Processing may take longer for longer videos."
          }
        },
        fr: {
          title: "Comptage des barrières",
          shortDescription: "Comptage des poissons à l'aide de vidéos de surveillance des rivières.",
          longDescription: "Cet outil utilise la vision par ordinateur pour analyser chaque image des vidéos de surveillance des rivières, détectant et classifiant les saumons lorsqu'ils passent par des barrières de comptage. Le modèle d'IA aide à automatiser l'identification des espèces et améliore la précision du suivi des populations.\n\nTéléversez une vidéo pour commencer. **Cet outil est destiné à des fins de démonstration uniquement—ne téléversez pas de données sensibles.**",
          actionButtonText: "Téléverser une vidéo",
          settings: {
            speciesLabel: "Espèces à compter",
            all: "Toutes les espèces",
            sockeye: "Saumon rouge uniquement",
            chum: "Saumon kéta uniquement",
            chinook: "Saumon chinook uniquement",
            coho: "Saumon coho uniquement",
            pink: "Saumon rose uniquement",
            directionLabel: "Direction du comptage",
            both: "Les deux directions",
            upstream: "En amont uniquement",
            downstream: "En aval uniquement",
            trackObjects: "Suivre les poissons individuellement",
            trackObjectsTooltip: "Activez cette option pour suivre les poissons individuellement et éviter les doubles comptages",
            modelInfo: "Le modèle actuel est optimisé pour de bonnes conditions de visibilité. Le traitement peut prendre plus de temps pour les vidéos plus longues."
          }
        }
      },
      csvAnalyzer: {
        en: {
          title: "CSV/PDF Analyzer",
          shortDescription: "Extract insights from documents using structured prompts.",
          longDescription: "This tool enables structured document analysis by processing CSV-based prompts against PDF files. Users can define specific questions or extraction tasks in a CSV file, and the tool will analyze the uploaded document accordingly.\n\nUpload a CSV file containing your prompts and a PDF document to get started. **This tool is for demonstration purposes only—do not upload sensitive data.**",
          actionButtonText: "Upload Files",
          settings: {
            aiModel: "AI Model",
            gpt4omini: "GPT-4o mini (default)",
            gpt4o: "GPT-4o",
            gpt35: "GPT-3.5",
            analysisType: "Analysis Type",
            summary: "Summary Overview",
            detailed: "Detailed Analysis",
            comparison: "Comparative Analysis",
            custom: "Custom Prompt",
            outputOptions: "Output Options",
            outputOptionsTooltip: "Configure how you want the analysis results displayed. 'Show Document Sources' includes page numbers and paragraph references for each response.",
            showSources: "Show Document Sources",
            outputFormats: "Output Formats",
            outputFormatsTooltip: "Select one or more formats for the output",
            textOutput: "Text Output",
            csvOutput: "CSV Output",
            jsonOutput: "JSON Output",
            fileSizeNote: "For large files, detailed analysis may take more time."
          }
        },
        fr: {
          title: "Analyseur CSV/PDF",
          shortDescription: "Extraire des informations des documents à l'aide de requêtes structurées.",
          longDescription: "Cet outil permet l'analyse structurée des documents en traitant des requêtes basées sur des fichiers CSV appliquées aux fichiers PDF. Les utilisateurs peuvent définir des questions spécifiques ou des tâches d'extraction dans un fichier CSV, et l'outil analysera le document en conséquence.\n\nTéléversez un fichier CSV contenant vos requêtes et un document PDF pour commencer. **Cet outil est destiné à des fins de démonstration uniquement—ne téléversez pas de données sensibles.**",
          actionButtonText: "Téléverser des fichiers",
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
          }
        }
      },
      pdfChatbot: {
        en: {
          title: "PDF Chatbot",
          shortDescription: "Chat live with your documents using AI-powered search.",
          longDescription: "This tool uses OpenAI's language model to answer questions about uploaded documents. It provides direct responses with sourced references, making document exploration faster and more efficient.\n\nUpload a document or try one of the provided sample documents to start interacting with its contents.",
          actionButtonText: "Upload Document",
          settings: {
            modelType: "AI Model",
            gpt4omini: "GPT-4o mini (default)",
            gpt4o: "GPT-4o",
            gpt35: "GPT-3.5",
            contextWindow: "Context Window Size",
            contextWindowTooltip: "Controls how many past exchanges to include for context. Higher values provide more context but may slow responses.",
            followupQuestions: "Suggest Follow-up Questions",
            followupTooltip: "AI will suggest relevant follow-up questions after each response",
            chatHistoryNote: "Chat history is not saved after you close the session."
          }
        },
        fr: {
          title: "Chatbot PDF",
          shortDescription: "Discutez avec vos documents grâce à une recherche IA.",
          longDescription: "Cet outil utilise le modèle linguistique d'OpenAI pour répondre aux questions sur les documents téléversés. Il fournit des réponses directes avec des références, facilitant ainsi l'exploration des documents.\n\nTéléversez un document ou utilisez l'un des documents d'exemple fournis pour commencer.",
          actionButtonText: "Téléverser un document",
          settings: {
            modelType: "Modèle d'IA",
            gpt4omini: "GPT-4o mini (par défaut)",
            gpt4o: "GPT-4o",
            gpt35: "GPT-3.5",
            contextWindow: "Taille de la fenêtre contextuelle",
            contextWindowTooltip: "Contrôle le nombre d'échanges passés à inclure pour le contexte. Des valeurs plus élevées fournissent plus de contexte mais peuvent ralentir les réponses.",
            followupQuestions: "Suggérer des questions de suivi",
            followupTooltip: "L'IA suggérera des questions de suivi pertinentes après chaque réponse",
            chatHistoryNote: "L'historique des conversations n'est pas enregistré après la fermeture de la session."
          }
        }
      },
      piiRedactor: {
        en: {
          title: "PII Redactor",
          shortDescription: "Automatically redact personal data from PDF documents.",
          longDescription: "This tool leverages Microsoft Presidio to detect and redact Personally Identifiable Information (PII) such as names, addresses, and phone numbers in PDF documents. It helps enhance data privacy by automatically censoring sensitive content.\n\nUpload a PDF or use a sample document to see the redaction process in action.",
          actionButtonText: "Upload PDF",
          settings: {
            redactionMethod: "Redaction Method",
            mask: "Mask with: ███",
            useTypeLabel: "Use [TYPE]",
            useTypeTooltip: "Replace redacted info with its type label (e.g., [NAME], [EMAIL])",
            redactionColorLabel: "Redaction Color",
            infoToRedact: "Information to Redact",
            infoTooltip: "Select which types of personal information should be identified and redacted from your document",
            entities: {
              PERSON: "Names",
              EMAIL_ADDRESS: "Email Addresses",
              PHONE_NUMBER: "Phone Numbers",
              ADDRESS: "Addresses",
              SIN: "SIN Numbers",
              CREDIT_CARD: "Credit Card Numbers"
            },
            redactorHelperText: "All redaction is performed locally in your browser. No sensitive data is sent to any server."
          }
        },
        fr: {
          title: "Rédacteur de PII",
          shortDescription: "Anonymisez automatiquement les données personnelles dans les PDF.",
          longDescription: "Cet outil utilise Microsoft Presidio pour détecter et masquer les informations personnelles identifiables (PII) telles que les noms, adresses et numéros de téléphone dans les fichiers PDF. Il contribue à renforcer la confidentialité des données en censurant automatiquement les informations sensibles.\n\nTéléversez un PDF ou utilisez un document d'exemple pour voir comment fonctionne l'anonymisation.",
          actionButtonText: "Téléverser un PDF",
          settings: {
            redactionMethod: "Méthode d'anonymisation",
            mask: "Masquer avec: ███",
            useTypeLabel: "Utiliser [TYPE]",
            useTypeTooltip: "Remplace les informations anonymisées par leur type (ex: [NOM], [EMAIL])",
            redactionColorLabel: "Couleur d'anonymisation",
            infoToRedact: "Informations à anonymiser",
            infoTooltip: "Sélectionnez les types d'informations personnelles à identifier et anonymiser dans votre document",
            entities: {
              PERSON: "Noms",
              EMAIL_ADDRESS: "Adresses e-mail",
              PHONE_NUMBER: "Numéros de téléphone",
              ADDRESS: "Adresses",
              SIN: "Numéros NAS",
              CREDIT_CARD: "Numéros de carte bancaire"
            },
            redactorHelperText: "Toute l'anonymisation est effectuée localement dans votre navigateur. Aucune donnée sensible n'est envoyée à un serveur."
          }
        }
      },
      sensitivityScore: {
        en: {
          title: "Sensitivity Score Calculator",
          shortDescription: "Check the sensitivity score of an uploaded document.",
          longDescription: "This tool uses Microsoft Presidio to analyze documents and determine their sensitivity score based on the presence of Personally Identifiable Information (PII). The higher the score, the more likely a document contains sensitive data.\n\nUpload a PDF document to get started. **These samples are for demonstration purposes only—do not upload sensitive data.**",
          actionButtonText: "Upload PDF",
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
            weightSum: "Weights add up to {totalWeight}%, must be exactly 100%"
          }
        },
        fr: {
          title: "Calculateur de score de sensibilité",
          shortDescription: "Vérifiez le score de sensibilité d'un document téléchargé.",
          longDescription: "Cet outil utilise Microsoft Presidio pour analyser les documents et déterminer leur score de sensibilité en fonction de la présence d'informations personnelles identifiables (PII). Plus le score est élevé, plus le document est susceptible de contenir des données sensibles.\n\nTéléversez un document PDF pour commencer. **Ces exemples sont destinés à des fins de démonstration uniquement—ne téléversez pas de données sensibles.**",
          actionButtonText: "Téléverser un PDF",
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
            weightSum: "Les poids s'additionnent à {totalWeight}%, ils doivent être exactement 100%"
          }
        }
      },
      frenchTranslator: {
        en: {
          title: "English-French Translation Bot",
          shortDescription: "Translate English documents to French using AI.",
          longDescription: "This tool uses Google's multilingual AI model (MADLAD400 10B) to translate PDF documents from English to French. It provides fast and efficient translations for various types of content while maintaining context and readability.\n\nUpload a document or use a sample file to test the translation process.",
          actionButtonText: "Upload PDF",
          settings: {
            modelType: "Model Type",
            modelTypeTooltip: "Select the type of translation model best suited for your document.",
            modelScientific: "Scientific Model",
            modelHR: "Translation Bureau Model",
            preserveFormatting: "Preserve Formatting",
            preserveFormattingTooltip: "Maintains document layout, tables, and styles during translation.",
            modelInfo: "This model is optimized for French translation in different professional domains."
          }
        },
        fr: {
          title: "Bot de traduction anglais-français",
          shortDescription: "Traduisez vos documents de l'anglais au français avec l'IA.",
          longDescription: "Cet outil utilise le modèle d'IA multilingue de Google (MADLAD400 10B) pour traduire les documents PDF de l'anglais au français. Il fournit des traductions rapides et efficaces tout en maintenant le contexte et la lisibilité.\n\nTéléversez un document ou utilisez un fichier d'exemple pour tester le processus de traduction.",
          actionButtonText: "Téléverser un PDF",
          settings: {
            modelType: "Type de modèle",
            modelTypeTooltip: "Sélectionnez le type de modèle de traduction le mieux adapté à votre document.",
            modelScientific: "Modèle scientifique",
            modelHR: "Modèle du Bureau de la traduction",
            preserveFormatting: "Préserver la mise en forme",
            preserveFormattingTooltip: "Maintient la mise en page du document, les tableaux et les styles lors de la traduction.",
            modelInfo: "Ce modèle est optimisé pour la traduction française dans différents domaines professionnels."
          }
        }
      },
      aiToolsDropdown: {
        en: {
          home: "AI Tools Home",
          selectTool: "Select a tool",
          categories: {
            "Computer Vision": "Computer Vision",
            "Large Language Models": "Large Language Models"
          },
          tools: {
            "Scale Ageing": "Scale Ageing",
            "Fence Counting": "Fence Counting",
            "CSV/PDF Analyzer": "CSV/PDF Analyzer",
            "PDF Chatbot": "PDF Chatbot",
            "PII Redactor": "PII Redactor",
            "Sensitivity Score Calculator": "Sensitivity Score Calculator",
            "French Translation": "French Translation"
          }
        },
        fr: {
          home: "Accueil des outils IA",
          selectTool: "Sélectionnez un outil",
          categories: {
            "Computer Vision": "Vision par ordinateur",
            "Large Language Models": "Modèles de langage avancés"
          },
          tools: {
            "Scale Ageing": "Estimation de l'âge des poissons",
            "Fence Counting": "Comptage des poissons",
            "CSV/PDF Analyzer": "Analyseur CSV/PDF",
            "PDF Chatbot": "Chatbot PDF",
            "PII Redactor": "Rédacteur de PII",
            "Sensitivity Score Calculator": "Calculateur de score de sensibilité",
            "French Translation": "Traduction français"
          }
        }
      },
    };
  
    export function getToolTranslations(toolName, language) {
        return toolTranslations[toolName]?.[language] || {};
      }