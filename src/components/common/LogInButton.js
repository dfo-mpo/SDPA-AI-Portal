/**
 * User options dropdown menu component.
 * Provides a dropdown with user account-related options such as profile,
 * account settings, and logout functionality.
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import ListItemText from '@mui/material/ListItemText';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useLanguage, useAuth } from '../../contexts';
import { getLayoutTranslations } from '../../translations/layout';
import { trackEvent } from '../../utils/analytics';

/**
 * Options menu for user profile actions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Callback function for logout action
 * @returns {JSX.Element} The rendered component
 */
export default function LogInButton({ onLogout, onLogin }) {
  const theme = useTheme();
  const styles = useComponentStyles('logInButton');
  const { language } = useLanguage();
  const menuTranslations = getLayoutTranslations('userMenu', language);
  const isAuth = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    }
  };

  const renderLogInButton = () => {
    return (
      <Button 
        size="small" 
        onClick={handleLogin}
        startIcon={<LoginRoundedIcon />}
        sx={styles.logInButton}
      >
        <ListItemText>{menuTranslations.login}</ListItemText>
      </Button>
    )
  }

  const renderLogOutButton = () => {
    return (
      <IconButton
        size="small"
        onClick={handleLogout}
      >
        <LogoutRoundedIcon />
      </IconButton>
    )
  }

  return (
    <>
      {/* {isAuth? renderLogOutButton() : renderLogInButton()} */}
      {renderLogInButton()}
    </>
  );
}

LogInButton.propTypes = {
  /** Callback function for logout action */
  onLogout: PropTypes.func
};