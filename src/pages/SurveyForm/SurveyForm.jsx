/**
 * AI Registry Intake Form Page
 *
 * Displays information about the AI Registry Intake Form and provides
 * a button to open the external Microsoft Forms link in a new tab.
 */

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { ExternalLink } from 'lucide-react';
import Banner from '../../components/common/Banner';
import { useLanguage } from '../../contexts';

const FORM_URL = 'https://forms.cloud.microsoft/pages/responsepage.aspx?id=rv2UFdmhBUSRXQEUZyNDOLQfbSSCW6hGliwG6pAiolZURVZPVk1JS1EySzg3T1RWWFpWTERFVDZKRyQlQCN0PWcu&route=shorturl';

export function SurveyForm() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "AI Registry Intake Form",
      subtitle: "Submit your AI use case to the DFO AI Registry",
      description: "This form is meant to be used as a guide to support business users in articulating and imagining the potential of using Data, Artificial Intelligence, and Machine Learning to improve productivity, efficiencies, and generate value for program and service delivery, operations, and other business processes. It is meant to help users determine the value and potential of new data innovation from a value proposition, scalability, and sustainability lens rather than a technical implementation perspective. Complete responses will help management along with Data and AI Scientists determine how feasible a solution could be.",
      buttonLabel: "Open AI Registry Intake Form",
      buttonNote: "Opens in a new tab",
    },
    fr: {
      title: "Formulaire d'admission au registre IA",
      subtitle: "Soumettez votre cas d'utilisation de l'IA au registre IA du MPO",
      description: "Ce formulaire est conçu pour aider les utilisateurs à articuler et à imaginer le potentiel de l'utilisation des données, de l'intelligence artificielle et de l'apprentissage automatique pour améliorer la productivité, l'efficacité et créer de la valeur pour la prestation de programmes et de services, les opérations et d'autres processus d'affaires. Il vise à aider les utilisateurs à déterminer la valeur et le potentiel de la nouvelle innovation en matière de données sous l'angle de la proposition de valeur, de l'évolutivité et de la durabilité, plutôt que d'une perspective de mise en œuvre technique. Des réponses complètes aideront la direction ainsi que les scientifiques des données et de l'IA à déterminer la faisabilité d'une solution.",
      buttonLabel: "Ouvrir le formulaire d'admission au registre IA",
      buttonNote: "S'ouvre dans un nouvel onglet",
    }
  };

  const t = language === 'fr' ? content.fr : content.en;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Banner */}
      <Banner
        title={t.title}
        description={t.subtitle}
        backgroundImage="/assets/robot.png"
        variant="hero"
      />

      {/* Content card */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 2,
        }}
      >
        {/* Description text */}
        <Typography
          variant="body1"
          sx={{
            fontSize: '1rem',
            lineHeight: 1.8,
            mb: 4,
            color: (theme) => theme.palette.text.primary,
          }}
        >
          {t.description}
        </Typography>

        {/* Action button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            size="large"
            endIcon={<ExternalLink size={18} />}
            onClick={() => window.open(FORM_URL, '_blank', 'noopener,noreferrer')}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontWeight: 500,
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            {t.buttonLabel}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {t.buttonNote}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default SurveyForm;