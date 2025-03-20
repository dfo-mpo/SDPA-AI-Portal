/**
 * Sign In component for authentication
 * 
 * Provides the user login form with email/password and social login options.
 */

import React, { useState } from 'react';
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
    useTheme
} from '@mui/material';
import { useLanguage } from '../../contexts';
import { ForgotPassword } from '.';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../common/CustomIcons';
import { signInStyles } from '../../styles/componentStyles';

export default function SignIn({ onLogin }) {
    const { language } = useLanguage();
    const theme = useTheme();
    const styles = signInStyles(theme);
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    // Translations
    const translations = {
        en: {
            title: "Sign in to DFO AI Portal",
            email: "Email",
            emailPlaceholder: "your@email.com",
            password: "Password",
            passwordPlaceholder: "••••••••",
            rememberMe: "Remember me",
            signIn: "Sign in",
            forgotPassword: "Forgot your password?",
            or: "or",
            signInWithGoogle: "Sign in with Google",
            signInWithFacebook: "Sign in with Facebook",
            noAccount: "Don't have an account?",
            signUp: "Sign up"
        },
        fr: {
            title: "Connectez-vous au portail d'IA du MPO",
            email: "Courriel",
            emailPlaceholder: "votre@courriel.com",
            password: "Mot de passe",
            passwordPlaceholder: "••••••••",
            rememberMe: "Se souvenir de moi",
            signIn: "Se connecter",
            forgotPassword: "Mot de passe oublié?",
            or: "ou",
            signInWithGoogle: "Se connecter avec Google",
            signInWithFacebook: "Se connecter avec Facebook",
            noAccount: "Vous n'avez pas de compte?",
            signUp: "S'inscrire"
        }
    };

    const t = translations[language] || translations.en;

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

        onLogin();
    };

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
        onLogin();
    };

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
                        {t.signIn}
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
                        onClick={() => handleSocialLogin('Google')}
                        startIcon={<GoogleIcon />}
                    >
                        {t.signInWithGoogle}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleSocialLogin('Facebook')}
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
