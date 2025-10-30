'use client';
import { useEffect, useState, useRef } from "react";
import { Box, Button } from '@mui/material';
import { CloudUpload  } from 'lucide-react';
import WebViewer from '@pdftron/webviewer';

const DocxEditor = ({ 
  file = 'ai_ml_document/Statistical and ML algorithms Guide.docx', // Fallback if url params not include file path
  enableOfficeEditing = false
}) => {
  const viewer = useRef(null);
  const initialized = useRef(false);
  const instanceRef = useRef(null);
  const [fileExists, setFileExists] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiEndpoint = '/api';
  const docPath = `${apiEndpoint}/docx/${file}`;

  useEffect(() => {
    if (!file  || initialized.current) return;
    initialized.current = true; // prevent multiple init

    fetch(docPath, { method: 'HEAD' })
      .then((res) => {
        // Ensure response correct content type
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application')) {
          throw new Error('Invalid document response');
        }
        
        WebViewer(
          {
            path: '/lib/webviewer',
            initialDoc: docPath,
            enableOfficeEditing,
            licenseKey: 'demo:1750444548238:61daf9b903000000004d14c55be15ae0b77115e5570861099c08de9d72',
          },
          viewer.current,
        ).then((instance) => {
          instanceRef.current = instance;
        });
      })
      .catch((err) => {
        console.error(err);
        setFileExists(false);
      });
  }, [docPath]);

  const handleSave = async () => {
    if (!instanceRef.current) return;
    setSaving(true);

    // Get folder path and filenames
    const lastSlashIndex = file.lastIndexOf('/');
    const folder = file.substring(0, lastSlashIndex);
    const filename = file.substring(lastSlashIndex + 1);

    try {
      const { documentViewer, annotationManager } = instanceRef.current.Core;

      const doc = documentViewer.getDocument();
      const xfdfString = await annotationManager.exportAnnotations();
      const data = await doc.getFileData({
        // saves the document with annotations in it
        xfdfString
      });
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      // Add code for handling Blob here
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('folder', folder);

      const res = await fetch(`${apiEndpoint}/docx/saveEdits`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Save to blob failed');
      alert('Document saved successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box 
      className="docxEditorContainer"
      sx={{ 
        height: "100%"
      }}
    >
      {!fileExists ? (
        <Box>Document does not exist.</Box>
      ) : (
        <Box>
          <Box 
            className="webviewer" 
            ref={viewer}
            sx={{ 
              height: "100vh",
              minHeight: "1200px",
            }}
          ></Box>
          {enableOfficeEditing  &&
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                my: 2,
              }}
            >
              <Button
                variant="contained" 
                startIcon={<CloudUpload  size={16} />}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : 'Save Edits'}
              </Button>
            </Box>}
        </Box>
      )
    }
    </Box>
  );
};

export default DocxEditor;
