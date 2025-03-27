/**
 * Portal home page component.
 * Displays the landing page of the application with a welcome banner
 * and introduction to the DFO AI tools portal.
 */

import React from 'react';
import { Typography, Paper, Box, Alert, useTheme } from '@mui/material';
import { Banner } from '../components/common';
import { useLanguage } from '../contexts';
import { useComponentStyles } from '../styles/hooks/useComponentStyles';
// import ThemeDebugger from '../components/common/ThemeDebugger'; uncomment to use for theme debugging

export default function Home() {
  const { language } = useLanguage();
  const theme = useTheme();
  
  // Get styles from our component styles system
  const homeStyles = useComponentStyles('homePage');

  // Translations
  const translations = {
    en: {
      title: "Government AI Portal",
      description: "Harnessing AI to enhance research, decision-making, and operational efficiency in fisheries and oceans science.",
      heading: "Welcome to the DFO PSSI AI Portal",
      body: "Welcome to the DFO PSSI AI Portal, a platform designed to explore the potential of artificial intelligence in fisheries and oceans research. This portal features tools powered by computer vision and large language models, helping scientists analyze data, automate tasks, and uncover new insights.\n\nUse the Tools menu on the left to discover AI-driven solutions that support DFO's mission.",
      alert: "Demonstration Use Only: These tools are prototypes designed to illustrate possible AI applications for DFO scientists. Please avoid uploading any sensitive or operational data."
    },
    fr: {
      title: "Portail IA du Gouvernement",
      description: "Exploiter l'intelligence artificielle pour améliorer la recherche, la prise de décision et l'efficacité opérationnelle dans le domaine des sciences halieutiques et océaniques.",
      heading: "Bienvenue sur le Portail IA du PSSI MPO",
      body: "Bienvenue sur le Portail IA du PSSI MPO, une plateforme dédiée à l'exploration du potentiel de l'intelligence artificielle dans la recherche sur les pêches et les océans. Ce portail met en avant des outils utilisant la vision par ordinateur et les modèles de langage avancés pour aider les scientifiques à analyser des données, automatiser des tâches et découvrir de nouvelles perspectives.\n\nUtilisez le menu des outils à gauche pour explorer les solutions basées sur l'IA qui soutiennent la mission du MPO.",
      alert: "Utilisation à des fins de démonstration uniquement : Ces outils sont des prototypes destinés à illustrer les applications possibles de l'IA pour les scientifiques du MPO. Veuillez éviter de téléverser des données sensibles ou opérationnelles."
    }
  };

  return (
    <>
      <Banner
        title={translations[language].title}
        description={translations[language].description}
        backgroundImage="/assets/sockeye-banner.jpg"
        variant="hero"
      />

      <Box sx={homeStyles.container}>
        <Paper variant="outlined" sx={{
          ...homeStyles.paper,
          p: { xs: 3, sm: 4 }  // Increased padding for better spacing
        }}>
          {/* Heading - using mix of home and tool styles for the best appearance */}
          <Typography variant="h4" sx={{
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : '#26374A',
            fontFamily: '"Lato", "Noto Sans", sans-serif',
            fontWeight: 600,
            fontSize: '1.75rem',
            mb: 3,
            lineHeight: 1.3
          }}>
            {translations[language].heading}
          </Typography>
          
          {/* Body text - using tool description style with some enhancements */}
          <Typography variant="body1" sx={{
            fontFamily: '"Lato", "Noto Sans", sans-serif',
            fontSize: '1rem',
            color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[800],
            lineHeight: 1.8,
            mb: 1,
            '& strong': {
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            },
            whiteSpace: 'pre-line'  // Properly handles the line breaks in the text
          }}>
            {translations[language].body}
          </Typography>
        </Paper>

        {/* Alert with improved styling */}
        <Alert 
          severity="warning" 
          sx={{
            mt: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main,
              alignSelf: 'center'
            },
            '& .MuiAlert-message': {
              fontFamily: '"Lato", "Noto Sans", sans-serif',
              fontWeight: 500
            }
          }}
        >
          {translations[language].alert}
        </Alert>
      </Box>
    </>
  );
}