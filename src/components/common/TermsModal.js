// Update TermsModal.js for improved styling:

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TermsAndConditions from './TermsAndConditions';
import { useLanguage } from '../../contexts';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { getTermsTranslations } from '../../translations/components/terms';
import { Check, X } from 'lucide-react';

function TermsModal({ 
  open, 
  onClose, 
  onAccept, 
  onDecline, 
  showButtons = true,
  variant = 'summary',
  disableCloseButton = false,
  showCloseButton = false
}) {
  const { language } = useLanguage();
  const styles = useComponentStyles('termsModal');
  
  // Get translations
  const t = getTermsTranslations(language).modal;

  // Handle decline specifically
  const handleDecline = () => {
    // Set a flag to show warning on the sign-in page
    localStorage.setItem('dfo-terms-rejected', 'true');
    
    // Trigger storage event to notify sign-in page
    window.dispatchEvent(new Event('storage'));
    
    // Call the original onDecline
    onDecline();
  };

  return (
    <Dialog 
      open={open} 
      onClose={disableCloseButton ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: styles.dialogPaper
      }}
      aria-labelledby="terms-dialog-title"
      // Prevent closing by clicking outside only during login flow
      disableEscapeKeyDown={disableCloseButton}
      disableBackdropClick={disableCloseButton}
    >
      <DialogTitle id="terms-dialog-title" sx={styles.dialogTitle}>
        <Typography variant="h5" component="div">
          {t.title}
        </Typography>
        {!disableCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={styles.dialogContent}>
        <Box sx={styles.contentContainer}>
          <TermsAndConditions variant={variant} />
        </Box>
      </DialogContent>
      
      <DialogActions sx={styles.dialogActions}>
        {showButtons ? (
          <>
            <Button 
              onClick={handleDecline} 
              color="inherit" 
              startIcon={<X size={16} />}
              sx={styles.declineButton}
            >
              {t.declineButton}
            </Button>
            <Button 
              onClick={onAccept} 
              variant="contained" 
              color="primary"
              startIcon={<Check size={16} />}
              sx={styles.acceptButton}
            >
              {t.acceptButton}
            </Button>
          </>
        ) : showCloseButton ? (
          <Button 
            onClick={onClose} 
            variant="outlined" 
            color="primary"
            sx={styles.closeButton}
          >
            {t.closeButton}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

TermsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  showButtons: PropTypes.bool,
  variant: PropTypes.oneOf(['full', 'summary']),
  disableCloseButton: PropTypes.bool,
  showCloseButton: PropTypes.bool
};

export default TermsModal;