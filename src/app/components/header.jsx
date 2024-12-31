'use client'

import React, { useState, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation'; 
import Link from 'next/link';
import styles from '../styles/header.module.css'; 
import { styled } from '@mui/material/styles';;
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { setCookie, getCookie } from 'cookies-next';
import { Typography } from '@mui/material';
import { IconButton, Drawer, Box } from '@mui/material';
// import { ExpandMore, ExpandLess } from '@mui/icons-material';


// Logic for the header in the website, including toggling of language and theme settings
function Header() {
    const [theme, setTheme] = useState('light'); // Will always be 'light' or 'dark'
    const [language, setLanguage] = useState('english'); // Will always be 'english' or 'french'
    const [isMenuOpen, setMenuOpen] = useState(false); 
    const { t } = useTranslation('common')

    const ThemeSwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
          margin: 1,
          padding: 0,
          transform: 'translateX(6px)',
          transition: 'transform 0.6s ease',
          '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff',
              )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
          width: 32,
          height: 32,
          '&::before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
              '#fff',
            )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
          },
        },
        '& .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
          borderRadius: 20 / 2,
        },
    }));

    const LanguageSwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
          margin: 1,
          padding: 0,
          transform: 'translateX(6px)',
          '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
              color: '#fff !important',
              top: 7.5,
              left: 0.5,
              content: '"FR"',
            },
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
          width: 32,
          height: 32,
          '&::before': {
            content: "''",
            color: '#fff !important',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 7.5,
            left: 0.5,
            content: '"EN"',
          },
        },
        '& .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
          borderRadius: 20 / 2,
        },
    }));

    // Update variable and cookie for theme
    const toggleTheme = (event) => {  
      setTheme(event.target.checked? 'dark' : 'light');
      setCookie('theme', event.target.checked? 'dark' : 'light');
    };

    // Update variable and cookie for language
    const toggleLanguage = (event) => {
      setLanguage(event.target.checked? 'french' : 'english');
      setCookie('language', event.target.checked? 'french' : 'english');
    }

    // Open/close the menu drawer
    const toggleMenuDrawer = (open) => (event) => {  
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {  
          return;  
        }  
        setMenuOpen(open);  
    };  

    // Update CSS settings for theme
    useEffect(() => {
      document.body.className = theme;
      document.documentElement.style.setProperty('--color-scheme', theme);
    }, [theme])

    // Read cookies
    useEffect(() => {
      // If theme cookie is not set, then set theme based on browser preferences and adjust theme
      if (!getCookie('theme')) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      } else {
        setTheme(getCookie('theme'));
      }
      
      setLanguage(getCookie('language')? getCookie('language') : 'english');
    }, [])

    return (
        <>
            <header className={styles.header}>
                <title>{(language === 'french')? "Portail de données sur le saumon du Pacifique" : "Pacific Salmon Data Portal"}</title>
                <link rel="icon" type="image/png" href="https://wet-boew.github.io/themes-dist/GCWeb/GCWeb/assets/favicon.ico"></link>
                <div className={styles.headerRow}>
                    <div className={styles.menuContainer}>  
                        <IconButton onClick={toggleMenuDrawer(true)} className={styles.menuBtn} edge="start" color="inherit" aria-label="menu">  
                            <img src="/icons/menu.svg" alt="menu icon" style={{ filter: theme === 'dark' ? 'invert(1)' : 'invert(0)' }} />  
                        </IconButton>  
                        <Drawer anchor="left"
                            open={isMenuOpen}  
                            onClose={toggleMenuDrawer(false)}  
                        >  
                            <Box id={styles.menuContent}>
                                <Typography className={styles.title} variant='h5'><span>{t('menu-title1')}</span><span>{t('menu-title2')}</span> </Typography>
                                <div className={styles.line}/>
                                <Link className={styles.link} href="/components/about"><Typography>{t('menu-main')}</Typography></Link>
                                <Link className={styles.link} href="/components/catalog"><Typography>{t('menu-home')}</Typography></Link>
                                <Link className={styles.link} href="/components/visualization"><Typography>{t('menu-fence')}</Typography></Link>
                                <Link className={styles.link} href="/components/visualization"><Typography>{t('menu-ageing')}</Typography></Link>
                                <Link className={styles.link} href="/components/feedback"><Typography>{t('menu-help')}</Typography></Link>
                            </Box> 
                        </Drawer>  
                    </div> 
                    <img id={styles.banner} src={(theme === 'dark')? "/imgs/bannerDark.svg" : "/imgs/bannerLight.svg"} alt="Government of Canada" property="logo" />
                    <div className={styles.toggles} style={{marginRight: (language === 'french') ? '18px' : '0px'}}>
                        <FormControlLabel
                            control={<ThemeSwitch sx={{ m: 1 }} checked={theme === 'dark'} onChange={(event) => { toggleTheme(event) }} />}
                            label={(language === 'french')? "Thème" : "Theme"}
                        />
                        <FormControlLabel
                            control={<LanguageSwitch sx={{ m: 1 }} checked={language === 'french'} onChange={(event) => { toggleLanguage(event) }} />}
                            label={(language === 'french')? "Langue" : "Language"}
                        />
                    </div>      
                </div>                
            </header>
        </>
    );
}

export default Header;