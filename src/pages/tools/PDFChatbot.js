/**
 * PDF Chatbot Tool Component
 * 
 * Main component for the PDF Chatbot tool, which allows users to chat with 
 * their PDF documents using AI. This component displays the user interface
 * for the tool, including its description and upload functionality.
 */

import React from 'react';
import { useTheme } from '@mui/material';
import { ToolPage } from '../../components/tools';
import { useLanguage } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function PDFChatbot() {
  const { language } = useLanguage();
  const theme = useTheme();
  const toolData = getToolTranslations("pdfChatbot", language);
  const toolStyles = useComponentStyles('tool');

  /**
   * Handle document upload
   * 
   * @param {File} file - The selected file
   */
  const handleFileSelected = (file) => {
    alert(`File selected: ${file.name}`);
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/robot.png"
      actionButtonText={toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      containerSx={toolStyles.container}
    />
  );
}
