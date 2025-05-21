/**
 * Theme mode selection dropdown.
 * Allows users to switch between light, dark, and system theme modes.
 * Appears in the application header.
 */

import * as React from 'react';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material/styles';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { getLayoutTranslations } from '../../translations/layout';
import { useLanguage } from '../../contexts';

/**
 * Color mode selection dropdown
 * 
 * @param {Object} props - Additional props to pass to the IconButton
 * @returns {JSX.Element} The rendered component
 */
export default function ColorModeIconDropdown(props) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const styles = useComponentStyles('colorModeIconDropdown');
  const { language } = useLanguage();
  const themeTranslations = getLayoutTranslations('header', language).theme;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMode = (targetMode) => () => {
    setMode(targetMode);
    localStorage.setItem('theme', targetMode); // persist it
    handleClose();

    const root = document.documentElement;

    if (targetMode === 'dark') {
      root.classList.add('dark');
    } else if (targetMode === 'light') {
      root.classList.remove('dark');
    } else {
      // system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  };

  const resolvedMode = systemMode || mode;
  const icon = {
    light: <LightModeIcon />,
    dark: <DarkModeIcon />,
  }[resolvedMode];

  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={styles.iconButton}
        {...props}
      >
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: styles.menu.paper,
        }}
      >
        <MenuItem selected={mode === 'system'} onClick={handleMode('system')}>
          {themeTranslations.system}
        </MenuItem>
        <MenuItem selected={mode === 'light'} onClick={handleMode('light')}>
          {themeTranslations.light}
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={handleMode('dark')}>
          {themeTranslations.dark}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}