/**
 * User Profile Component
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { OptionsMenu } from '.';
import { useLanguage } from '../../contexts';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { useMsal } from '@azure/msal-react';

export default function UserProfile ({
  onLogout,
  onLogin
}) {
  const theme = useTheme();
  const { language } = useLanguage();

  const { accounts } = useMsal();
  const user = accounts[0] ?? null;

  const styles = useComponentStyles('userProfile');

  return (
    // Bottom Profile Section
    <Box sx={styles.profileSection}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          alt={user ? user.name : 'Guest'}
          src="/static/images/avatar/7.jpg"
          sx={styles.avatar}
        />
        <Box sx={styles.userInfo}>
          <Typography variant="body2" sx={styles.userName}>
            {user ? user.name : 'Guest'}
          </Typography>
          <Typography variant="caption" sx={styles.userEmail}>
            {user ? user.username : 'guest@example.com'}
          </Typography>
        </Box> 
        <OptionsMenu onLogout={onLogout} onLogin={onLogin} user={user} />
      </Stack>
    </Box>
  );
}

UserProfile.propTypes = {
   /** Callback function for logout action */
    onLogout: PropTypes.func,
  
    /** Callback function for login action */
    onLogin: PropTypes.func,
};