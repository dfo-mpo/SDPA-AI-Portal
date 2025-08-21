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
      title: "DFO OCDS and SDPA AI Portal",
      description: "Harnessing AI to enhance research, decision-making, and operational efficiency in fisheries and oceans science.",
      heading: "Welcome to the DFO OCDS and SDPA AI Portal",
      body: "Welcome to the DFO Office of the Chief Data Steward (OCDS) and Strategic Data Policy and Analytics (SDPA) AI Portal, a platform designed to explore the potential of artificial intelligence in fisheries and oceans research. Our initiatives harness the power of advanced data and A.I. technologies like machine learning, computer vision, and natural language processing to revolutionize how to support marine conservation and rebuilding efforts in the modern data and digital era. \n\nUse the Tools menu on the left to explore AI-enabled solutions to revolutionize sustainability, conservation, and management of our oceans. Dive into a future where technology empowers us to preserve marine ecosystems more effectively than ever before!",
      alert: "Demonstration Use Only: These tools are prototypes designed to illustrate possible AI applications for DFO scientists, therefore, are strictly for educational purposes and are not to be used in any work processes. Please avoid uploading any sensitive or operational data."
    },
    app: {
      title: "DFO OCDS and SDPA AI Portal"
    },
    userMenu: {
      profile: "Profile",
      account: "My account",
      addAccount: "Add another account",
      settings: "Settings",
      logout: "Logout",
      login: "Login"
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
      title: "Portail IA du MPO BIPD et PADS",
      description: "Exploiter l'intelligence artificielle pour améliorer la recherche, la prise de décision et l'efficacité opérationnelle dans le domaine des sciences halieutiques et océaniques.",
      heading: "Bienvenue sur le Portail IA du MPO BIPD et PADS",
      body: "Bienvenue sur le portail IA du Bureau de l’intendante principale des données (BIPD) et de la Politique et analyse des données stratégiques sur le saumon (PADS) du MPO, une plateforme conçue pour explorer le potentiel de l'intelligence artificielle dans la recherche sur les pêches et les océans. Nos initiatives exploitent la puissance des données avancées et des technologies d'IA telles que l'apprentissage automatique, la vision par ordinateur et le traitement du langage naturel afin de révolutionner la manière dont nous soutenons les efforts de conservation et de reconstitution des ressources marines à l'ère moderne des données et du numérique. \n\nUtilisez le menu Outils situé à gauche pour découvrir les solutions basées sur l'IA qui révolutionnent la durabilité, la conservation et la gestion de nos océans. Plongez dans un avenir où la technologie nous permet de préserver les écosystèmes marins plus efficacement que jamais !",
      alert: "Utilisation à des fins de démonstration uniquement : Ces outils sont des prototypes conçus pour illustrer les applications possibles de l'IA pour les scientifiques du MPO. Ils sont donc strictement réservés à des fins éducatives et ne doivent pas être utilisés dans le cadre de processus de travail. Veuillez éviter de télécharger des données sensibles ou opérationnelles."
    },
    app: {
      title: "Portail IA du MPO BIPD et PADS"
    },
    userMenu: {
      profile: "Profil",
      account: "Mon compte",
      addAccount: "Ajouter un autre compte",
      settings: "Paramètres",
      logout: "Déconnexion",
      login: "Connexion"
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