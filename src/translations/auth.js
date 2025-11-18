/**
 * Authentication Component Translations
 */

export const en = {
    signIn: {
      title: "Sign in to DFO Pacific AI Hub",
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      rememberMe: "Remember me",
      signInButton: "Sign in",
      forgotPassword: "Forgot your password?",
      or: "or",
      signInWithGoogle: "Sign in with Google",
      signInWithFacebook: "Sign in with Facebook",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      termsRejectedWarning: "You must accept the Terms and Conditions to sign in. Please try again.",
      validation: {
        emailRequired: "Please enter a valid email address.",
        passwordRequired: "Password must be at least 6 characters long."
      },
      signInWithMsalButton: "Login With Microsoft Entra ID",
      demoAccessButton: "Access Demo Hub Without Signing In",
    },
    forgotPassword: {
      title: "Reset password",
      description: "Enter your account's email address, and we'll send you a link to reset your password.",
      emailPlaceholder: "Email address",
      cancel: "Cancel",
      continue: "Continue"
    }
  };
  
  export const fr = {
    signIn: {
      title: "Connectez-vous au hub d'IA du MPO",
      email: "Courriel",
      emailPlaceholder: "votre@courriel.com",
      password: "Mot de passe",
      passwordPlaceholder: "••••••••",
      rememberMe: "Se souvenir de moi",
      signInButton: "Se connecter",
      forgotPassword: "Mot de passe oublié?",
      or: "ou",
      signInWithGoogle: "Se connecter avec Google",
      signInWithFacebook: "Se connecter avec Facebook",
      noAccount: "Vous n'avez pas de compte?",
      signUp: "S'inscrire",
      termsRejectedWarning: "Vous devez accepter les conditions générales pour vous connecter. Veuillez réessayer.",
      validation: {
        emailRequired: "Veuillez saisir une adresse courriel valide.",
        passwordRequired: "Le mot de passe doit comporter au moins 6 caractères."
      },
      signInWithMsalButton: "Se connecter avec Microsoft Entra ID",
      demoAccessButton: "Accéder au hub de démonstration sans se connecter",
    },
    forgotPassword: {
      title: "Réinitialiser le mot de passe",
      description: "Entrez l'adresse courriel de votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
      emailPlaceholder: "Adresse courriel",
      cancel: "Annuler",
      continue: "Continuer"
    }
  };
  
  /**
   * Get auth translations for specific component
   * 
   * @param {string} component - Component name ('signIn' or 'forgotPassword')
   * @param {string} language - Language code ('en' or 'fr')
   * @returns {Object} - Translations object for the component
   */
  export function getAuthTranslations(component, language) {
    const translations = language === 'fr' ? fr : en;
    
    if (component && translations[component]) {
      return translations[component];
    }
    
    return translations;
  }