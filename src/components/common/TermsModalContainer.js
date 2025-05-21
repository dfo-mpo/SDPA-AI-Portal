// src/components/common/TermsModalContainer.js
import React from 'react';
import PropTypes from 'prop-types';
import TermsModal from './TermsModal';
import { useTerms } from '../../contexts';

function TermsModalContainer({ showButtons = true, variant = 'summary', isAuth = false }) {
  const { 
    showTermsModal, 
    acceptTerms, 
    declineTerms, 
    closeTermsModal,
    loginPending
  } = useTerms();

  // If we're authenticated (viewing from dashboard), we only need a close button
  // Otherwise during login flow, we need the accept/decline buttons
  const showActionButtons = !isAuth && showButtons;
  
  return (
    <TermsModal
      open={showTermsModal}
      onClose={closeTermsModal}
      onAccept={acceptTerms}
      onDecline={declineTerms}
      showButtons={showActionButtons}
      variant={variant}
      // Disable close button during login flow
      disableCloseButton={loginPending && !isAuth}
      // Show a single "Close" button if viewing from dashboard
      showCloseButton={isAuth}
    />
  );
}

TermsModalContainer.propTypes = {
  showButtons: PropTypes.bool,
  variant: PropTypes.oneOf(['full', 'summary']),
  isAuth: PropTypes.bool
};

export default TermsModalContainer;