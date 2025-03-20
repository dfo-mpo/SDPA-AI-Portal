/**
 * Portal home page component.
 * Displays the landing page of the application with a welcome banner
 * and introduction to the DFO AI tools portal.
 */

import React from 'react';
import { Typography, Paper, Box, Alert, useTheme } from '@mui/material';
import { Banner } from '../components/common';
import { useLanguage } from '../contexts';
import { homePageStyles } from '../styles/componentStyles';
import ThemeDebugger from '../components/common/ThemeDebugger';

export default function Home() {
  const { language } = useLanguage();
  const theme = useTheme();
  const styles = homePageStyles(theme);

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

      <Box sx={styles.container}>
        <Paper variant="outlined" sx={styles.paper}>
          <Typography variant="h4" sx={styles.heading}>
            {translations[language].heading}
          </Typography>
          <Typography variant="body1" sx={styles.body}>
            {translations[language].body}
          </Typography>
        </Paper>

        {/* Alert Box for Disclaimer */}
        <Alert severity="warning" sx={styles.alert}>
          {translations[language].alert}
        </Alert>
        {/* Add the ThemeDebugger component here */}
        <ThemeDebugger />
      </Box>
    </>
  );
}
