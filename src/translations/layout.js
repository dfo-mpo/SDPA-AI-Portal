/**
 * Layout Component Translations
 */

export const en = {
    header: {
      department: "Fisheries and Oceans Canada",
      language: "Français",
      theme: {
        system: "System",
        light: "Light",
        dark: "Dark"
      }
    },
    leftPanel: {
      homeButton: "Return to home",
      toolSelection: "Tool Selection",
      settings: "Settings",
      user: {
        profile: "Profile",
        account: "My account",
        addAccount: "Add another account",
        settings: "Settings",
        logout: "Logout"
      }
    },
    toolDropdown: {
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
    dashboard: {
      disabledToolAlert: "This tool is temporarily unavailable while we make improvements. Please check back later."
    },
    homePage: {
      title: "Government AI Portal",
      description: "Harnessing AI to enhance research, decision-making, and operational efficiency in fisheries and oceans science.",
      heading: "Welcome to the DFO PSSI AI Portal",
      body: "Welcome to the DFO PSSI AI Portal, a platform designed to explore the potential of artificial intelligence in fisheries and oceans research. This portal features tools powered by computer vision and large language models, helping scientists analyze data, automate tasks, and uncover new insights.\n\nUse the Tools menu on the left to discover AI-driven solutions that support DFO's mission.",
      alert: "Demonstration Use Only: These tools are prototypes designed to illustrate possible AI applications for DFO scientists. Please avoid uploading any sensitive or operational data."
    },
    app: {
      title: "DFO AI Portal"
    },
    userMenu: {
      profile: "Profile",
      account: "My account",
      addAccount: "Add another account",
      settings: "Settings",
      logout: "Logout"
    }
  };
  
  export const fr = {
    header: {
      department: "Pêches et Océans Canada",
      language: "English",
      theme: {
        system: "Système",
        light: "Clair",
        dark: "Sombre"
      }
    },
    leftPanel: {
      homeButton: "Retour à l'accueil",
      toolSelection: "Sélection d'outils",
      settings: "Paramètres",
      user: {
        profile: "Profil",
        account: "Mon compte",
        addAccount: "Ajouter un autre compte",
        settings: "Paramètres",
        logout: "Déconnexion"
      }
    },
    toolDropdown: {
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
    },
    dashboard: {
      disabledToolAlert: "Cet outil est temporairement indisponible pendant que nous l'améliorons. Veuillez réessayer plus tard."
    },
    homePage: {
      title: "Portail IA du Gouvernement",
      description: "Exploiter l'intelligence artificielle pour améliorer la recherche, la prise de décision et l'efficacité opérationnelle dans le domaine des sciences halieutiques et océaniques.",
      heading: "Bienvenue sur le Portail IA du PSSI MPO",
      body: "Bienvenue sur le Portail IA du PSSI MPO, une plateforme dédiée à l'exploration du potentiel de l'intelligence artificielle dans la recherche sur les pêches et les océans. Ce portail met en avant des outils utilisant la vision par ordinateur et les modèles de langage avancés pour aider les scientifiques à analyser des données, automatiser des tâches et découvrir de nouvelles perspectives.\n\nUtilisez le menu des outils à gauche pour explorer les solutions basées sur l'IA qui soutiennent la mission du MPO.",
      alert: "Utilisation à des fins de démonstration uniquement : Ces outils sont des prototypes destinés à illustrer les applications possibles de l'IA pour les scientifiques du MPO. Veuillez éviter de téléverser des données sensibles ou opérationnelles."
    },
    app: {
      title: "Portail d'IA du MPO"
    },
    userMenu: {
      profile: "Profil",
      account: "Mon compte",
      addAccount: "Ajouter un autre compte",
      settings: "Paramètres",
      logout: "Déconnexion"
    }
  };
  
  /**
   * Get layout translations for specific component
   * 
   * @param {string} component - Component name ('header', 'leftPanel', 'toolDropdown', etc.)
   * @param {string} language - Language code ('en' or 'fr')
   * @returns {Object} - Translations object for the component
   */
  export function getLayoutTranslations(component, language) {
    const translations = language === 'fr' ? fr : en;
    
    if (component && translations[component]) {
      return translations[component];
    }
    
    return translations;
  } 