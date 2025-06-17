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
    Divider,
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

export default function SignIn({ onLogin }) {
    const { language } = useLanguage();
    const t = getAuthTranslations('signIn', language);
    const theme = useTheme();
    const styles = signInStyles(theme);
    const { termsAccepted, startLoginFlow, loginPending } = useTerms();
    const [showTermsRejectedWarning, setShowTermsRejectedWarning] = useState(false);

    /**
     * Effect: Watches for the user's acceptance of terms and a pending login state.
     *
     * Trigger Conditions:
     * - `termsAccepted` becomes `true` (user clicks "Accept" in terms modal).
     * - `loginPending` is `true` (set when user clicks "Log in" button).
     *
     * Behavior:
     * - When both conditions are met, triggers authentication.
     * - `onLogin()` passed from `App.js` will call MSAL login.
     */
    useEffect(() => {
        // If terms are accepted and we're in the middle of login flow, complete the login
        if (termsAccepted && loginPending) {
            onLogin();
        }
    }, [termsAccepted, loginPending, onLogin]);

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
     * Actual login execution using MSAL happens in `onLogin()` once terms are accepted.
     */
    const handleSubmit = (event) => {
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
                    onSubmit={handleSubmit}
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
                <Divider>{t.or}</Divider>
                <Box>
                    {/* Access Demo Portal Without Signing In */}
                    <Button
                        fullWidth
                        variant="outlined"
                        href="https://sdpa-ai-computervision-portal-demo.azurewebsites.net/"
                    >
                        {t.demoAccessButton}
                    </Button>
                </Box>
            </Card>
        </Stack>
    );
}

SignIn.propTypes = {
    onLogin: PropTypes.func.isRequired
};