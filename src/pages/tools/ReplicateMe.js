/**
 * Replicate Me Tool Component
 *
 * Displays the AI Hub documentation as an inline PDF viewer with
 * download controls, and a document-scoped chatbot below it.
 * Available to all users (authenticated and unauthenticated).
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Send, Bot, RefreshCw, Download} from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { processPdfDocument, askOpenAI } from '../../services/apiService';
import { useIsAuthenticated } from '@azure/msal-react';

// Path to the static AI Hub documentation PDF in public/assets/
const DOC_PATH = '/assets/AI_Hub_Documentation.pdf';
const DOC_NAME  = 'AI_Hub_Documentation.pdf';

export function ReplicateMe() {
  const { language } = useLanguage();
  const toolData = getToolTranslations('replicateMe', language);
  const theme    = useTheme();
  const isAuth   = useIsAuthenticated();

  const { replicateMeSettings } = useToolSettings();

  // ── Document processing state ────────────────────────────────────────────
  const [fileContent,   setFileContent]   = useState(null);
  const [isDocLoading,  setIsDocLoading]  = useState(true);
  const [docError,      setDocError]      = useState(null);

  // ── Chat state ───────────────────────────────────────────────────────────
  const [messages,        setMessages]        = useState([]);
  const [llmChatHistory,  setLlmChatHistory]  = useState(['']);
  const [currentMessage,  setCurrentMessage]  = useState('');
  const [isResponding,    setIsResponding]     = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Auto-load the documentation PDF on mount ─────────────────────────────
  useEffect(() => {
    const loadDoc = async () => {
      try {
        setIsDocLoading(true);
        setDocError(null);

        const res  = await fetch(DOC_PATH);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const file = new File([blob], DOC_NAME, { type: 'application/pdf' });

        const result = await processPdfDocument([file]);
        setFileContent({ text_chunks: result.text_chunks, metadata: result.metadata });

        setMessages([{
          role:      'bot',
          content:   toolData.bot.initialGreeting,
          timestamp: new Date(),
        }]);
      } catch (err) {
        console.error('Error loading documentation:', err);
        setDocError(toolData.ui.docLoadError);
      } finally {
        setIsDocLoading(false);
      }
    };

    loadDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Download handler 
  const handleDownload = () => {
    const a    = document.createElement('a');
    a.href     = DOC_PATH;
    a.download = DOC_NAME;
    a.click();
  };

  //
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !fileContent || isResponding) return;

    const userMessage = { role: 'user', content: currentMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsResponding(true);

    const tempResponse = { role: 'assistant', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, tempResponse]);

    try {
      const generator = askOpenAI(
        llmChatHistory,
        currentMessage,
        fileContent,
        replicateMeSettings,
        isAuth,
      );

      for await (const chunk of generator) {
        if (chunk.content) {
          tempResponse.content += chunk.content;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...tempResponse };
            return updated;
          });
        }
        if (chunk.finish_reason !== undefined && chunk.finish_reason !== null) break;
      }

      if (llmChatHistory[0] === '') {
        setLlmChatHistory([
          { role: 'user',      content: currentMessage       },
          { role: 'assistant', content: tempResponse.content },
        ]);
      } else {
        setLlmChatHistory(prev => [
          ...prev,
          { role: 'user',      content: currentMessage       },
          { role: 'assistant', content: tempResponse.content },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role:      'error',
          content:   toolData.error.processing,
          timestamp: new Date(),
        };
        return updated;
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //
  const handleResetChat = () => {
    setMessages([{
      role:      'bot',
      content:   toolData.bot.initialGreeting,
      timestamp: new Date(),
    }]);
    setLlmChatHistory(['']);
    setCurrentMessage('');
  };

  //
  const renderAssistantMessage = (message) => {
    let content = message.content;
    content = content.replace(/```/g, '').replace(/^\s*html\s*/i, '').trim();
    content = content.replace(/Source_page:/g, 'Source Page:');

    const tableStyle = `
      <style>
        table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 6px 10px; text-align: left; }
        th { background-color: #f5f5f6;
             color: ${theme.palette.mode === 'dark' ? '#303f3f !important' : 'inherit'}; }
      </style>
    `;

    const marker      = 'Source Page:';
    const markerIndex = content.lastIndexOf(marker);

    if (markerIndex !== -1) {
      const mainContent   = content.substring(0, markerIndex).trim();
      const sourceContent = content.substring(markerIndex).trim();
      return (
        <Box>
          <div dangerouslySetInnerHTML={{ __html: tableStyle + mainContent }} />
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 1, color: 'text.secondary', fontStyle: 'italic' }}
          >
            {sourceContent}
          </Typography>
        </Box>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: tableStyle + content }} />;
  };

  //Render
  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/robot.png"
      hideActionButton={true}
    >
      {/* Guest banner */}
      {!isAuth && (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          {toolData.ui.loginPrompt}
        </Alert>
      )}

      {/* ── Stacked layout ───────────────────────────────────────────────── */}
      <Box
        sx={{
          display:        'flex',
          flexDirection:  'column',
          gap:             2,
          mt:              0.5,
          width:          '100%',
          minWidth:        0,
        }}
      >
        {/* PDF Viewer */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width:          '100%',
            height:         '100vh',
            minHeight:      '500px',
            overflow:       'hidden',
            borderRadius:   2,
            display:        'flex',
            flexDirection:  'column',
          }}
        >
          {/* PDF toolbar */}
          <Box
            sx={{
              px:             2,
              py:             0.75,
              borderBottom:   '1px solid',
              borderColor:    'divider',
              bgcolor:        'action.hover',
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {toolData.ui.docViewerTitle}
            </Typography>

            {/*Download controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Download documentation">
                <IconButton size="small" onClick={handleDownload}>
                  <Download size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* iframe container*/}
          <Box
            sx={{
              flex:     1,
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <iframe
              src={`${DOC_PATH}#toolbar=1&navpanes=1&scrollbar=1`}
              title={toolData.ui.docViewerTitle}
              style={{
                border:          'none',
                display:         'block',
                width:           `100%`,
                height:          `80vh`
              }}
            />
          </Box>
        </Paper>

        {/* ── Chatbot ──────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width:          '100%',
            minWidth:        0,
            display:        'flex',
            flexDirection:  'column',
            borderRadius:   2,
            overflow:       'hidden',
            minHeight:      '50vh',
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              px:             2,
              py:             1.25,
              borderBottom:   '1px solid',
              borderColor:    'divider',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              bgcolor:        'action.hover',
              flexShrink:     0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                <Bot size={15} />
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {toolData.ui.chatHeader}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleResetChat}
              disabled={isResponding || isDocLoading}
              title={toolData.ui.resetChat}
            >
              <RefreshCw size={15} />
            </IconButton>
          </Box>

          {/* Messages list */}
          <Box
            sx={{
              flex:           1,
              overflowY:      'auto',
              p:               2,
              display:        'flex',
              flexDirection:  'column',
              gap:             1.5,
            }}
          >
            {/* Loading state */}
            {isDocLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                <CircularProgress size={16} />
                <Typography variant="body2">{toolData.ui.loadingDoc}</Typography>
              </Box>
            )}

            {/* Error state */}
            {docError && !isDocLoading && (
              <Alert severity="error">{docError}</Alert>
            )}

            {/* Messages */}
            {!isDocLoading && !docError && messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px:           1.5,
                    py:           1,
                    maxWidth:     '88%',
                    bgcolor:
                      msg.role === 'user'  ? 'primary.main'  :
                      msg.role === 'error' ? 'error.light'   :
                      'action.hover',
                    color:
                      msg.role === 'user'  ? 'primary.contrastText' :
                      msg.role === 'error' ? 'error.contrastText'   :
                      'text.primary',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                  }}
                >
                  {msg.role === 'assistant'
                    ? renderAssistantMessage(msg)
                    : <Typography variant="body2">{msg.content}</Typography>
                  }
                </Paper>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.25, mx: 0.5, fontSize: '0.68rem' }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            ))}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input row */}
          <Box
            sx={{
              p:            1.5,
              borderTop:    '1px solid',
              borderColor:  'divider',
              display:      'flex',
              gap:           1,
              flexShrink:   0,
            }}
          >
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={3}
              placeholder={toolData.ui.askQuestion}
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isResponding || isDocLoading || !!docError}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={
                !currentMessage.trim() ||
                isResponding             ||
                isDocLoading             ||
                !!docError               ||
                !fileContent
              }
              endIcon={
                isResponding
                  ? <CircularProgress size={14} color="inherit" />
                  : <Send size={15} />
              }
              sx={{ minWidth: 80, alignSelf: 'flex-end' }}
            >
              {isResponding ? toolData.ui.thinking : toolData.ui.send}
            </Button>
          </Box>
        </Paper>
      </Box>
    </ToolPage>
  );
}

export default ReplicateMe;