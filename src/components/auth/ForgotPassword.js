/**
 * Forgot Password Dialog Component
 * Allows users to request a password reset email
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    OutlinedInput,
    useTheme,
    Paper
} from '@mui/material';
import { getAuthTranslations } from '../../translations/auth';

import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
// For now, use a placeholder style object since useComponentStyles may have issues
const placeholderStyles = {
    dialog: {
        width: '100%',
        maxWidth: '500px',
        padding: 2,
        backgroundColor: theme => theme.palette.background.paper,
        border: theme => `1px solid ${theme.palette.divider}`,
        boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    dialogContent: {
        paddingBottom: 2,
        paddingTop: 1,
        backgroundColor: theme => theme.palette.background.paper,
    },
    dialogActions: {
        padding: 2,
        paddingTop: 0,
        backgroundColor: theme => theme.palette.background.paper,
    }
};

function ForgotPassword({ open, handleClose, language = 'en' }) {
    const theme = useTheme();
    // const forgotPasswordStyles = useComponentStyles('forgotPassword');
    const forgotPasswordStyles = placeholderStyles;

    const t = getAuthTranslations('forgotPassword', language);

    const handleSubmit = (event) => {
        event.preventDefault();
        // In a real app, this would send a password reset email
        console.log('Password reset requested for:', event.target.email.value);
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperComponent={Paper}
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${theme.palette.divider}`,
                    width: '100%',
                    maxWidth: '500px',
                }
            }}
        >
            <DialogTitle sx={{ bgcolor: theme.palette.background.paper }}>{t.title}</DialogTitle>
            <DialogContent sx={{ bgcolor: theme.palette.background.paper }}>
                <DialogContentText>
                    {t.description}
                </DialogContentText>
                <OutlinedInput
                    autoFocus
                    required
                    margin="dense"
                    id="email"
                    name="email"
                    placeholder={t.emailPlaceholder}
                    type="email"
                    fullWidth
                />
            </DialogContent>
            <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
                <Button onClick={handleClose}>{t.cancel}</Button>
                <Button variant="contained" type="submit">
                    {t.continue}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ForgotPassword.propTypes = {
    handleClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    language: PropTypes.string
};

export default ForgotPassword;
