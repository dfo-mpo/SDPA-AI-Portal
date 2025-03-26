/**
 * User options dropdown menu component.
 * Provides a dropdown with user account-related options such as profile,
 * account settings, and logout functionality.
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { MenuButton } from '.';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';


// Styled menu item with consistent margin
const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

/**
 * Options menu for user profile actions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Callback function for logout action
 * @returns {JSX.Element} The rendered component
 */
export default function OptionsMenu({ onLogout }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const styles = useComponentStyles('optionsMenu');
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <React.Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={styles.menuButton}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: styles.menu.list,
          [`& .${paperClasses.root}`]: styles.menu.paper,
          [`& .${dividerClasses.root}`]: styles.menu.divider,
        }}
      >
        <MenuItem onClick={handleClose} disabled>Profile</MenuItem>
        <MenuItem onClick={handleClose} disabled>My account</MenuItem>
        <Divider />
        <MenuItem onClick={handleClose} disabled>Add another account</MenuItem>
        <MenuItem onClick={handleClose} disabled>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={styles.logoutMenuItem}>
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

OptionsMenu.propTypes = {
  /** Callback function for logout action */
  onLogout: PropTypes.func,
};