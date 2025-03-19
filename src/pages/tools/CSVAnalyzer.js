/**
 * CSV Analyzer Tool Component
 * 
 * Main component for the CSV/PDF Analyzer tool, which allows users to analyze 
 * structured data from CSV and PDF files. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React from 'react';
import { useTheme } from '@mui/material';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function CSVAnalyzer() {
  const { language } = useLanguage();
  const theme = useTheme();
  const toolData = getToolTranslations("csvAnalyzer", language);
  // Use centralized tool styles – assuming the 'tool' key contains container styling.
  const toolStyles = useComponentStyles('tool');

  /**
   * Handle file upload
   * 
   * @param {File} file - The uploaded file
   */
  const handleFileSelected = (file) => {
    alert(`File selected: ${file.name}`);
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/analyze.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      // You can pass a container style if ToolPage uses it:
      containerSx={toolStyles.container}
    />
  );
}
