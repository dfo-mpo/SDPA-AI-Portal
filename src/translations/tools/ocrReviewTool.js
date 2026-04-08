/**
 * OCR Review and Validation Tool Translations
 */

export const en = {
    title: "OCR Review Tool",
    subtitle: "Review and Validate OCR Extracted Documents",
    body: {
      firstParagraph: "Several teams within DFO have trained custom OCR models using Azure Document Intelligence. Using the UI, they drew boxes around the data they wished to collect and then used our team’s scripts to run the model and extract PDF documents into JSON files for modification with this tool.",
      secondParagraph: "This in‑house web application allows subject matter experts to review extracted data against the original document, correct errors, and add any omitted content using the field names specified during the training process."
    },
    alertTitle: "Disclaimer",
    alertBody: { // Broken into parts for the <strong> tags instead of allowing dangerouslySetInnerHTML
        part1: "This tool is for ",
        part2: "demonstration purposes only",
        part3: " and is ",
        part4: "not",
        part5: " an enterprise solution. All documents found in the demo version of this tool are ",
        part6: "publicly accessible PDFs",
        part7: ", and any changes made affect only a copied version of the data. The tool is intended for educational and exploratory use with ",
        part8: "no production guarantees"
    },
    cardBody: "Explore the demo version of the review and validation tool here."
  };
  
  export const fr = {
    title: "Outil de vérification ROC",
    subtitle: "Révision et validation des documents extraits par ROC",
    body: {
      firstParagraph: "Plusieurs équipes au sein du MPO ont formé des modèles ROC personnalisés à l'aide d'Azure Document Intelligence. À l'aide de l'interface utilisateur, elles ont tracé des cadres autour des données qu'elles souhaitaient collecter, puis ont utilisé les scripts de notre équipe pour exécuter le modèle et extraire des documents PDF sous forme de fichiers JSON afin de les modifier avec cet outil.",
      secondParagraph: "Cette application web interne permet aux experts en la matière de vérifier les données extraites par rapport au document original, de corriger les erreurs et d’ajouter tout contenu omis à l’aide des noms de champs spécifiés lors du processus d’entraînement."
    },
    alertTitle: "Avertissement",
    alertBody: { // Broken into parts for the <strong> tags instead of allowing dangerouslySetInnerHTML
        part1: "Cet outil est destiné à ",
        part2: "des fins de démonstration uniquement",
        part3: " et n’est ",
        part4: "pas",
        part5: " une solution d’entreprise. Tous les documents trouvés dans la version de démonstration de cet outil sont ",
        part6: "des PDF accessibles au public",
        part7: ", et toute modification apportée n'affecte qu'une version copiée des données. L'outil est destiné à un usage éducatif et exploratoire, sans ",
        part8: "aucune garantie de production"
    },
    cardBody: "Découvrez la version de démonstration de l'outil de révision et de validation ici."
  };