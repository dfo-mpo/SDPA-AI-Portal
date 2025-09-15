/**
 * ML Model Repository Component
 *
 * Core component for the ML Model Repository tool, which enables users to
 * manage, explore, and interact with machine learning models. This component
 * provides the user interface for browsing available models, viewing model
 * metadata, uploading new models, and monitoring usage statistics.
 */

import React, { useState, useCallback } from 'react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { useIsAuthenticated } from '@azure/msal-react';

export function MLModelsRepo() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("mlModelsRepo", language);
  const isAuth = useIsAuthenticated();

  return (
    <ToolPage
      // Use the uploadKey to force re-creation of the file input when needed
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/calculations.png"
      hideActionButton
    >
    </ToolPage>
  );
}

export default MLModelsRepo;