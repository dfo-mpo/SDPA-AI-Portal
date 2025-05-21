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
    Checkbox,
    FormControlLabel,
    Divider,
    FormLabel,
    FormControl,
    Link,
    TextField,
    Typography,
    Stack,
    Card,
    useTheme,
    Alert
} from '@mui/material';
import { useLanguage, useTerms } from '../../contexts';
import { ForgotPassword } from '.';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../common/CustomIcons';
import { signInStyles } from '../../styles/componentStyles';
import { getAuthTranslations } from '../../translations/auth';
import { trackEvent } from '../../utils/analytics';

export default function SignIn({ onLogin }) {
    const { language } = useLanguage();
    const t = getAuthTranslations('signIn', language);
    const theme = useTheme();
    const styles = signInStyles(theme);
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const { termsAccepted, startLoginFlow, loginPending } = useTerms();
    const [showTermsRejectedWarning, setShowTermsRejectedWarning] = useState(false);

    
    // Effect to check for login completion after terms acceptance
    useEffect(() => {
        if (termsAccepted && loginPending) {
            // If terms are accepted and we're in the middle of login flow
            // complete the login
            onLogin();
        }
    }, [termsAccepted, loginPending, onLogin]);

    const handleForgotPasswordOpen = () => {
        setForgotPasswordOpen(true);
    };

    const handleForgotPasswordClose = () => {
        setForgotPasswordOpen(false);
    };

    const validateInputs = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage(language === 'en' 
                ? 'Please enter a valid email address.' 
                : 'Veuillez saisir une adresse courriel valide.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage(language === 'en'
                ? 'Password must be at least 6 characters long.'
                : 'Le mot de passe doit comporter au moins 6 caractères.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!validateInputs()) {
            return;
        }

        // Start login flow - this will check if terms are accepted
        // and show the modal if needed
        const canProceed = startLoginFlow();
        
        // If terms already accepted, proceed with login
        if (canProceed) {
            onLogin();
        } else {
            // Otherwise, terms modal will be shown
            // Login will be completed when terms are accepted (via useEffect)
            // If they were previously rejected, show the warning
            if (showTermsRejectedWarning) {
                setShowTermsRejectedWarning(true);
            }
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
        
        // Same flow as above but for social login
        const canProceed = startLoginFlow();
        if (canProceed) {
            onLogin();
        } else {
            if (showTermsRejectedWarning) {
                setShowTermsRejectedWarning(true);
            }
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
                    noValidate
                    sx={styles.form}
                >
                    <FormControl>
                        <FormLabel htmlFor="email">{t.email}</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder={t.emailPlaceholder}
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">{t.password}</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            name="password"
                            placeholder={t.passwordPlaceholder}
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label={t.rememberMe}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                    >
                        {t.signInButton}
                    </Button>
                    <Link
                        component="button"
                        type="button"
                        onClick={handleForgotPasswordOpen}
                        variant="body2"
                        sx={styles.forgotPassword}
                    >
                        {t.forgotPassword}
                    </Link>
                </Box>
                <Divider>{t.or}</Divider>
                <Box sx={styles.socialButtons}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {handleSocialLogin('Google');
                            trackEvent('Login Method', 'Selected Login Method', 'Google');
                        }}
                        startIcon={<GoogleIcon />}
                    >
                        {t.signInWithGoogle}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {handleSocialLogin('Facebook');
                            trackEvent('Login Method', 'Selected Login Method', 'Facebook');
                        }}
                        startIcon={<FacebookIcon />}
                    >
                        {t.signInWithFacebook}
                    </Button>
                    <Typography sx={styles.signupText}>
                        {t.noAccount}{' '}
                        <Link
                            href="#signup"
                            variant="body2"
                        >
                            {t.signUp}
                        </Link>
                    </Typography>
                </Box>
            </Card>

            <ForgotPassword 
                open={forgotPasswordOpen} 
                handleClose={handleForgotPasswordClose}
                language={language}
            />
        </Stack>
    );
}

SignIn.propTypes = {
    onLogin: PropTypes.func.isRequired
};