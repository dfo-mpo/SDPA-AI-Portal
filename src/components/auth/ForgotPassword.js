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
    useTheme
} from '@mui/material';

import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
// For now, use a placeholder style object since useComponentStyles may have issues
const placeholderStyles = {
    dialog: {
        width: '100%',
        maxWidth: '500px',
        padding: 2
    },
    dialogContent: {
        paddingBottom: 2,
        paddingTop: 1
    },
    dialogActions: {
        padding: 2,
        paddingTop: 0
    }
};

function ForgotPassword({ open, handleClose, language = 'en' }) {
    const theme = useTheme();
    // const forgotPasswordStyles = useComponentStyles('forgotPassword');
    const forgotPasswordStyles = placeholderStyles;


    // Translations
    const translations = {
        en: {
            title: "Reset password",
            description: "Enter your account's email address, and we'll send you a link to reset your password.",
            emailPlaceholder: "Email address",
            cancel: "Cancel",
            continue: "Continue"
        },
        fr: {
            title: "Réinitialiser le mot de passe",
            description: "Entrez l'adresse courriel de votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
            emailPlaceholder: "Adresse courriel",
            cancel: "Annuler",
            continue: "Continuer"
        }
    };

    const t = translations[language] || translations.en;

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
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit,
                    sx: forgotPasswordStyles.dialog,
                },
            }}
        >
            <DialogTitle>{t.title}</DialogTitle>
            <DialogContent sx={forgotPasswordStyles.dialogContent}>
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
            <DialogActions sx={forgotPasswordStyles.dialogActions}>
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
