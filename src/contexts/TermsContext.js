import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create context
const TermsContext = createContext();

// Context provider component
export function TermsProvider({ children }) {
  // State to track whether terms modal is shown
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // State to track whether terms have been accepted
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // State to track if we are in login flow
  const [loginPending, setLoginPending] = useState(false);
  
  // Check localStorage on mount to see if terms were previously accepted
  useEffect(() => {
    const acceptedStatus = localStorage.getItem('dfo-terms-accepted');
    if (acceptedStatus === 'true') {
      setTermsAccepted(true);
    }
  }, []);

  // Function to accept terms
  const acceptTerms = () => {
    localStorage.setItem('dfo-terms-accepted', 'true');
    setTermsAccepted(true);
    setShowTermsModal(false);
    // Return true to indicate terms were accepted
    return true;
  };

  // Function to decline terms
  const declineTerms = () => {
    localStorage.removeItem('dfo-terms-accepted');
    setTermsAccepted(false);
    setShowTermsModal(false);
    setLoginPending(false);
    // Return false to indicate terms were declined
    return false;
  };

  // Function to manually open terms modal
  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  // Function specifically for login flow
  const startLoginFlow = () => {
    setLoginPending(true);
    // Always show the modal on login, regardless of previous acceptance
    setShowTermsModal(true);
    return false; // Always return false to force terms acceptance on each login
  };

  // Function to close terms modal without accepting or declining
  const closeTermsModal = () => {
    setShowTermsModal(false);
    setLoginPending(false);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    // We keep the terms accepted status in localStorage
    // But we reset the state in the context
    setLoginPending(false);
    setShowTermsModal(false);
    // Optionally remove terms accepted from localStorage if you want 
    // users to re-accept terms on each login
    localStorage.removeItem('dfo-terms-accepted');
    setTermsAccepted(false);
  };

  // Context value
  const contextValue = {
    showTermsModal,
    termsAccepted,
    loginPending,
    acceptTerms,
    declineTerms,
    openTermsModal,
    closeTermsModal,
    startLoginFlow,
    handleLogout
  };

  return (
    <TermsContext.Provider value={contextValue}>
      {children}
    </TermsContext.Provider>
  );
}

// Custom hook for using terms context
export function useTerms() {
  return useContext(TermsContext);
}

TermsProvider.propTypes = {
  children: PropTypes.node.isRequired
};