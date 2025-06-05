/**
 * Sign In component for authentication
 * 
 * Provides the user login form with email/password and social login options.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Typography,
    Stack,
    Card,
    useTheme,
    Alert
} from '@mui/material';
import { useLanguage, useTerms } from '../../contexts';
import { SitemarkIcon } from '../common/CustomIcons';
import { signInStyles } from '../../styles/componentStyles';
import { getAuthTranslations } from '../../translations/auth';
import { useMsal } from '@azure/msal-react';

export default function SignIn({ onLogin }) {
    const { language } = useLanguage();
    const t = getAuthTranslations('signIn', language);
    const theme = useTheme();
    const styles = signInStyles(theme);
    const { termsAccepted, startLoginFlow, loginPending, declineTerms } = useTerms();
    const [showTermsRejectedWarning, setShowTermsRejectedWarning] = useState(false);
    const { instance } = useMsal();

    /**
     * Executes the Microsoft Entra ID (MSAL) login flow.
     *
     * Behavior:
     * - Triggers the MSAL login method to authenticate the user.
     * - On success: MSAL will update session state internally.
     *   - Post-login behaviors are handled globally in `App.js`.
     * 
     * - On failure: logs the error and resets the login flow
     *   by calling `declineTerms()` to stop the retry loop and clear pending state.
     *
     * This function is intended to be called after the user has accepted the terms of use.
     * Only called when `termsAccepted` and `loginPending` are both `true`.
     */
    const doMsalLogin = async () => {
        try {
            const loginResponse = await instance.loginRedirect();
            console.log('MSAL login response:', loginResponse);
        } catch (err) {
            console.error("MSAL login failed:", err);
            declineTerms();
        }
    };

    /**
     * Effect: Watches for the user's acceptance of terms and a pending login state.
     *
     * Trigger Conditions:
     * - `termsAccepted` becomes `true` (user clicks "Accept" in terms modal).
     * - `loginPending` is `true` (set when user clicks "Log in" button).
     *
     * Behavior:
     * - When both conditions are met, triggers authentication.
     * - In production: calls `doMsalLogin()` to initiate Microsoft Entra ID (MSAL) login.
     * 
     * Auth Toggle vs Demo Mode Clarification:
     * - This effect allows **manual toggling** between real MSAL login and bypass mode, even in **production (non-demo)** mode.
     * - It is different from `isDemoMode`:
     * - `isDemoMode = true`: the app **completely bypasses the login page** and renders the Dashboard directly.
     */
    useEffect(() => {
        // If terms are accepted and we're in the middle of login flow, complete the login
        if (termsAccepted && loginPending) {
            doMsalLogin();
            onLogin();
        }
    }, [termsAccepted, loginPending, onLogin, doMsalLogin]);

    /**
     * Handles user-initiated login via the MSAL sign-in button.
     *
     * Behavior:
     * - Prevents default form submission behavior.
     * - Calls `startLoginFlow()` to initiate the terms and login flow.
     *   - This sets `loginPending = true` and shows the terms modal.
     * - If the user had already rejected terms (manually or via storage), 
     *   this function sets a flag to show a warning message.
     *
     * Actual login execution using MSAL happens in `doMsalLogin()` once terms are accepted.
     */
    const handleSubmitWithMsal = (event) => {
        event.preventDefault();

        // Start login flow - this will check if terms are accepted
        // and show the modal if needed
        const canProceed = startLoginFlow();
        
        if (!canProceed && showTermsRejectedWarning) {
            setShowTermsRejectedWarning(true);
        }
    };

    // When terms are rejected, show warning
    useEffect(() => {
        const handleStorageChange = () => {
            const termsStatus = localStorage.getItem('dfo-terms-rejected');
            if (termsStatus === 'true') {
                setShowTermsRejectedWarning(true);
                // Clear the flag
                localStorage.removeItem('dfo-terms-rejected');
            }
        };
        
        // Initial check
        handleStorageChange();
        
        // Listen for changes
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <Stack direction="column" justifyContent="center" sx={styles.signInContainer}>
            <Card variant="outlined" sx={styles.styledCard}>
                <SitemarkIcon />
                <Typography
                    component="h1"
                    variant="h4"
                    sx={styles.title}
                >
                    {t.title}
                </Typography>
                
                {showTermsRejectedWarning && (
                    <Alert 
                        severity="warning" 
                        sx={{ mb: 2 }}
                        onClose={() => setShowTermsRejectedWarning(false)}
                    >
                        {t.termsRejectedWarning}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmitWithMsal}
                >
                    {/* Sign in with Microsoft Entra ID */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                    >
                        {t.signInWithMsalButton}
                    </Button>
                </Box>
            </Card>
        </Stack>
    );
}

SignIn.propTypes = {
    onLogin: PropTypes.func.isRequired
};