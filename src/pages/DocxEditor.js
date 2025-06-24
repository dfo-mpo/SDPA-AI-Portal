'use client';
import { useEffect, useState, useRef } from "react";
import WebViewer from '@pdftron/webviewer';
import { Button } from '@mui/material';

export default function DocxEditor() {
  const viewer = useRef(null);
  const initialized = useRef(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true; // prevent multiple init
    
    WebViewer(
      {
        path: '/lib/webviewer',
        initialDoc: '/api/document/ai_ml_document/Statistical and ML algorithms Guide.docx',
        enableOfficeEditing: true,
      },
      viewer.current,
    ).then((instance) => {
        const { documentViewer } = instance.Core;
      });
  }, []);

  return (
    <>
    <div className="docxEditorContainer">
      <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
    </div>
    </>
  );
};
