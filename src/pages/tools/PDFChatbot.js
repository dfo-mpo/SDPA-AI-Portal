/**
 * PDF Chatbot Tool Component
 * 
 * Main component for the PDF Chatbot tool, which allows users to chat with 
 * their PDF documents using AI. This component displays the user interface
 * for the tool, including its description, upload functionality, chat interface,
 * and token usage information.
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
  LinearProgress,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { 
  Send, 
  Bot, 
  RefreshCw, 
  Thermometer, 
  FileText, 
  LogOut, 
  Download, 
  Clock,
  MessageCircle,
  Upload
} from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { processPdfDocument, askOpenAI } from '../../services/apiService';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';
import { trackEvent } from '../../utils/analytics';

export function PDFChatbot({ isDemoMode }) {
  const { language } = useLanguage();
  const toolData = getToolTranslations("pdfChatbot", language);
  
  // Get context settings from ToolSettingsContext
  const { pdfChatbotSettings, updatePdfChatbotTokenUsage } = useToolSettings();
  
  // Get styles from our styling system
  const toolStyles = useComponentStyles('tool');
  const styles = useComponentStyles('pdfChatbot');
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileContent, setFileContent] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [llmChatHistory, setLlmChatHistory] = useState(['']);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  
  // Chat session state
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [chatSummary, setChatSummary] = useState(null);
  const [endChatDialogOpen, setEndChatDialogOpen] = useState(false);
  const [chatStartTime, setChatStartTime] = useState(null);
  
  // Ref for scrolling to bottom of chat
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
    // Reset token usage on initial load and when language changes
  useEffect(() => {
    // Reset the token usage to 0 on component mount or language change
    updatePdfChatbotTokenUsage(pdfChatbotSettings.tokenUsage.used || 0);
  }, [language]);

  /**
   * Handle document upload
   * 
   * @param {File} files - The selected files
   */
  const handleFileSelected = async (files) => {
    if (!files) return;
    
    setSelectedFile(files);
    setIsFileProcessing(true);
    setIsChatEnded(false);
    setChatSummary(null);
    setChatStartTime(new Date());
    
    try {
      const response = await processPdfDocument(files);
      // console.log(response.text_chunks)
      // console.log(response.metadata)
      setFileContent({text_chunks: response.text_chunks, metadata: response.metadata});
      
      // Reset messages when new file is uploaded
      setMessages([
        {
          role: 'bot',
          content: toolData.bot.initialGreeting.replace('{fileName}', files.map(file => file.name)),
          timestamp: new Date()
        }
      ]);
      
      // Reset token usage for new file through context
      updatePdfChatbotTokenUsage(0, getTokenLimitForModel(pdfChatbotSettings.modelType));
      setIsFileUploaded(true);
    } catch (error) {
      console.error('Error processing file:', error);
      // Handle error
    } finally {
      setIsFileProcessing(false);
    }
  };
  
  /**
   * Get token limit based on model type
   * 
   * @param {string} modelType - The model type
   * @returns {number} The token limit
   */
  const getTokenLimitForModel = (modelType) => {
    switch (modelType) {
      case 'gpt4o':
        return 128000;
      case 'gpt4omini':
        return 100000;
      case 'gpt35':
        return 16000;
      default:
        return 100000;
    }
  };
  
  /**
   * Helper function to render assistant messages.
   * This function:
   * - Removes unwanted triple backticks.
   * - Removes any "html" at the very start.
   * - Replaces "Source_page:" with "Source Page:".
   * - Splits content if a source marker exists.
   */
  const renderAssistantMessage = (message) => {
    let content = message.content;
    
    // Remove all triple backticks.
    content = content.replace(/```/g, '');
    
    // Remove any "html" that appears at the beginning.
    content = content.replace(/^\s*html\s*/i, '');
    
    // Trim extra whitespace.
    content = content.trim();
    
    // Replace "Source_page:" with "Source Page:"
    content = content.replace(/Source_page:/g, 'Source Page:');
    
    // Add custom styling to fix table double borders
    const customStyle = `
      <style>
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
    `;
    
    // Split the content if the marker exists.
    const marker = "Source Page:";
    const markerIndex = content.lastIndexOf(marker);
    if (markerIndex !== -1) {
      const mainContent = content.substring(0, markerIndex).trim();
      const sourceContent = content.substring(markerIndex).trim();
      return (
        <div>
          <div dangerouslySetInnerHTML={{ __html: customStyle + mainContent }} />
          <Typography variant="caption" sx={{ display: 'block', marginTop: '8px', color: 'text.secondary', fontStyle: 'italic' }}>
            {sourceContent}
          </Typography>
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: customStyle + content }} />;
  };

  /**
   * Handle sending a message with live stream updates.
   */
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isChatEnded) return;
    
    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    // Append the user message
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsResponding(true);
    
    // Create a temporary assistant message for live updates
    const tempResponse = { role: 'assistant', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, tempResponse]);
    
    try {
      // Use the generator with settings from context
      const generator = askOpenAI(llmChatHistory, currentMessage, fileContent, pdfChatbotSettings);
      let tokensUsed = 0;
      
      // Process stream: update live as chunks arrive
      for await (const chunk of generator) {
        if (chunk.content) {
          // Append the chunk's content
          tempResponse.content += chunk.content;
          // Update the last message in the state to trigger re-render
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...tempResponse };
            return newMessages;
          });
        }
        
        // Break when finish reason is provided
        if (chunk.finish_reason !== undefined && chunk.finish_reason !== null) {
          tokensUsed = chunk.tokens_used;
          break;
        }
      }
      
      // Update LLM chat history
      if (llmChatHistory[0] === '') {
        setLlmChatHistory([{ role: 'user', content: currentMessage }, { role: 'assistant', content: tempResponse.content }]);
      } else {
        setLlmChatHistory(prev => [...prev, { role: 'user', content: currentMessage }, { role: 'assistant', content: tempResponse.content }]);
      }
      
      // Update token usage in context
      updatePdfChatbotTokenUsage(
        Math.min(
          pdfChatbotSettings.tokenUsage.total, 
          pdfChatbotSettings.tokenUsage.used + tokensUsed
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Display error message to the user
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'error', 
          content: 'Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date() 
        };
        return newMessages;
      });
    } finally {
      setIsResponding(false);
    }
  };
  
  /**
   * Handle key press event to send message on Enter.
   * @param {React.KeyboardEvent} event 
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  /**
   * Use a follow-up question suggestion.
   * @param {string} question 
   */
  const handleUseFollowupQuestion = (question) => {
    setCurrentMessage(question);
  };
  
  /**
   * Reset the chat.
   */
  const handleResetChat = () => {
    setChatStartTime(new Date());
    setIsChatEnded(false);
    setChatSummary(null);
    setMessages([
      {
        role: 'bot',
        content: toolData.bot.initialGreeting.replace('{fileName}', selectedFile.name),
        timestamp: new Date()
      }
    ]);
    setLlmChatHistory(['']);
    updatePdfChatbotTokenUsage(0);
  };
  
  /**
   * Open the end chat confirmation dialog
   */
  const handleOpenEndChatDialog = () => { 
    setEndChatDialogOpen(true);
  };
  
  /**
   * End the chat session and generate a summary
   */
  const handleEndChat = () => {
    setEndChatDialogOpen(false);
    setIsChatEnded(true);
    
    // Calculate session duration
    const endTime = new Date();
    const durationMs = chatStartTime ? endTime - chatStartTime : 0;
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor((durationMs % 60000) / 1000);
    
    // Count messages by type
    const userMessages = messages.filter(m => m.role === 'user').length;
    const botMessages = messages.filter(m => m.role === 'assistant' || m.role === 'bot').length;
    
    // Generate chat summary
    setChatSummary({
      fileName: selectedFile.name,
      fileSize: toolData.ui.fileInfo.size.replace('{size}', Math.round(selectedFile.size / 1024)),
      duration: `${durationMinutes}m ${durationSeconds}s`,
      messageCount: messages.length,
      userMessages,
      botMessages,
      tokensUsed: pdfChatbotSettings.tokenUsage.used,
      endTime: endTime.toLocaleString()
    });
    
    // Add a chat ended message
    setMessages(prev => [
      ...prev, 
      {
        role: 'system',
        content: toolData.ui.chatSessionEnded,
        timestamp: new Date()
      }
    ]);
  };
  
  /**
   * Start a new chat session
   */
  const handleStartNewChat = () => {
    handleResetChat();
  };
  
  /**
   * Upload a new document
   */
  const handleUploadNewDocument = () => {
    // Reset states
    setIsFileUploaded(false);
    setSelectedFile(null);
    setIsChatEnded(false);
    setChatSummary(null);
    setMessages([]);
    setLlmChatHistory(['']);
    updatePdfChatbotTokenUsage(0);
    
    // Programmatically trigger the file input click event after a short delay
    // to ensure the UI has updated
    setTimeout(() => {
      // Find the file input and trigger click
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      }
    }, 100);
  };
  
  // Calculate token usage percentage
  const tokenPercentage = (pdfChatbotSettings.tokenUsage.used / pdfChatbotSettings.tokenUsage.total) * 100;

  /**
   * Get temperature label text based on value
   */
  const getTemperatureLabel = (value) => {
    if (value <= 0.3) return toolData.ui.precise;
    if (value <= 0.7) return toolData.ui.balanced;
    return toolData.ui.creative;
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/robot.png"
      actionButtonText={isFileUploaded ? "Upload New Document" : toolData.actionButtonText}
      mutliUpload={true}
      onFileSelected={handleFileSelected}
      isProcessing={isFileProcessing}
      hideActionButton={isFileUploaded}
      uploadKey={Date.now()} // Ensure input is refreshed
      isDemoMode={isDemoMode}
    >
      {/* Chat interface appears only when a file is uploaded */}
      {isFileUploaded && (
        <Box sx={styles.chatContainer}>
          {/* Chat header with file info and token usage */}
          <Box sx={styles.chatHeader}>
            <Box sx={styles.pdfInfo}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <Bot size={18} />
              </Avatar>
              <Typography variant="body2" fontWeight={500}>
                {selectedFile.name} ({toolData.fileInfo.size.replace('{size}', Math.round(selectedFile.size / 1024))})
              </Typography>
            </Box>
            
                          {/* Token usage display */}
            <Box sx={styles.tokenStatusContainer}>
              {/* Temperature indicator */}
              <Tooltip title={toolData.tooltips.temperature}>
                <Chip
                  icon={<Thermometer size={14} />}
                  label={`${pdfChatbotSettings.temperature.toFixed(1)} - ${getTemperatureLabel(pdfChatbotSettings.temperature)}`}
                  size="small"
                  variant="outlined"
                  sx={styles.temperatureChip}
                />
              </Tooltip>
              
              {/* Token usage counter */}
              <Tooltip title={toolData.tooltips.tokenUsage}>
                <Box sx={styles.tokenCounter}>
                                        <Typography variant="body2" sx={styles.tokenText}>
                      {pdfChatbotSettings.tokenUsage.used.toLocaleString()} / {pdfChatbotSettings.tokenUsage.total.toLocaleString()}
                    </Typography>
                </Box>
              </Tooltip>
              
              {/* Action buttons */}
              
              {/* Reset button */}
              <Tooltip title={toolData.tooltips.resetChat}>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    trackEvent('PDF Chatbot Interaction', 'Reset Chat', 'Chat Reset Button');
                    handleResetChat();
                  }}
                  disabled={isResponding}
                  sx={{
                    width: '28px',
                    height: '28px',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <RefreshCw size={16} />
                </IconButton>
              </Tooltip>
              
              {/* End chat button */}
              <Tooltip title={toolData.tooltips.endChat}>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    trackEvent('PDF Chatbot Interaction', 'Open End Chat Dialog', 'End Chat Dialog Button');
                    handleOpenEndChatDialog();
                  }}
                  disabled={isResponding || isChatEnded}
                  sx={{
                    width: '28px',
                    height: '28px',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: isChatEnded ? 'divider' : 'primary.light',
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <LogOut size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Token usage progress bar */}
          <LinearProgress 
            variant="determinate" 
            value={tokenPercentage} 
            sx={{
              ...styles.tokenProgressBar, 
              '& .MuiLinearProgress-bar': {
                bgcolor: 
                  tokenPercentage > 90 ? 'error.main' : 
                  tokenPercentage > 70 ? 'warning.main' : 
                  'success.main'
              }
            }}
          />
          
          {/* Remaining tokens display */}
          <Box sx={styles.remainingTokensContainer}>
            <Typography variant="caption" sx={styles.remainingTokensText}>
              {(pdfChatbotSettings.tokenUsage.total - pdfChatbotSettings.tokenUsage.used).toLocaleString()} {toolData.ui.tokensRemaining}
            </Typography>
          </Box>
          
          {/* Messages container */}
          <Box sx={{
            ...styles.messagesContainer,
            height: 'auto',
            maxHeight: 'calc(100% - 180px)', // Adjust to allow room for input and header
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {messages.map((message, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {message.role === 'system' ? (
                  <Box sx={{
                    textAlign: 'center',
                    py: 1,
                    px: 2,
                    my: 2,
                    mx: 'auto',
                    backgroundColor: 'action.hover',
                    borderRadius: '16px',
                    display: 'inline-block',
                    maxWidth: '80%'
                  }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {message.content}
                    </Typography>
                  </Box>
                ) : message.role === 'error' ? (
                  // Error message
                  <Paper 
                    elevation={0} 
                    sx={{
                      ...styles.botMessage,
                      bgcolor: 'error.light',
                      color: 'error.contrastText'
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                  </Paper>
                ) : (
                  // Regular message (user or bot)
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Message bubble */}
                    <Paper 
                      elevation={0} 
                      sx={{
                        ...(message.role === 'user' ? styles.userMessage : styles.botMessage),
                        position: 'relative',
                        '&::after': message.role === 'user' ? {
                          content: '""',
                          position: 'absolute',
                          bottom: '10px',
                          right: '-8px',
                          width: 0,
                          height: 0,
                          borderTop: '8px solid transparent',
                          borderBottom: '8px solid transparent',
                          borderLeft: '10px solid',
                          borderLeftColor: 'primary.main'
                        } : {}
                      }}
                    >
                      {message.role === 'assistant' ? (
                        renderAssistantMessage(message)
                      ) : (
                        <Typography variant="body2">{message.content}</Typography>
                      )}
                    </Paper>
                    
                    {/* Timestamp for messages */}
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        ml: message.role === 'user' ? 0 : 2,
                        mr: message.role === 'user' ? 2 : 0,
                        fontSize: '0.7rem'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                )}
                
                {message.role === 'bot' && message.followupQuestions && (
                  <Stack direction="column" spacing={1} sx={{ mt: 1, ml: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {toolData.ui.suggestedQuestions}
                    </Typography>
                    
                    {message.followupQuestions.map((question, qIndex) => (
                      <Typography 
                        key={qIndex} 
                        variant="body2"
                        onClick={() => {
                          trackEvent('PDF Chatbot Interaction', 'Use Follow-up Question', 'Add additional question');
                          handleUseFollowupQuestion(question);
                        }}
                        sx={styles.followupQuestion}
                      >
                        {question}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
            
            {/* Chat summary shown when ended */}
            {isChatEnded && chatSummary && (
              <Card variant="outlined" sx={{ 
                mb: 2, 
                bgcolor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(250, 250, 250, 0.95)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                width: '100%',
                maxHeight: 'none', // Remove any height constraints
                display: 'block', // Ensure it uses block display mode
                overflow: 'visible' // Ensure content isn't hidden
              }}>
                <CardContent sx={{ 
                  p: 3,
                  height: 'auto', // Allow natural height 
                  overflow: 'visible' // Ensure content isn't clipped
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'text.primary',
                    fontWeight: 600
                  }}>
                    <MessageCircle size={18} />
                    {toolData.ui.chatSummary}
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                    gap: 2,
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(40, 40, 40, 0.95)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    p: 2,
                    borderRadius: 1,
                    height: 'auto', // Allow height to grow as needed
                    overflow: 'visible' // Ensure content is visible
                  }}>
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: 'text.primary',
                      fontWeight: 500,
                      wordBreak: 'break-word' // Allow long text to wrap
                    }}>
                      <FileText size={16} />
                      <span>
                        <strong>{toolData.ui.document}:</strong> {chatSummary.fileName} ({chatSummary.fileSize})
                      </span>
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: 'text.primary',
                      fontWeight: 500
                    }}>
                      <Clock size={16} />
                      <span>
                        <strong>{toolData.ui.duration}:</strong> {chatSummary.duration}
                      </span>
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: 'text.primary', 
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      <strong>{toolData.ui.messages}:</strong> {chatSummary.messageCount} ({chatSummary.userMessages} {toolData.ui.user}, {chatSummary.botMessages} {toolData.ui.assistant})
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: 'text.primary', 
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      <strong>{toolData.ui.tokensUsed}:</strong> {chatSummary.tokensUsed.toLocaleString()}
                    </Typography>
                    
                    <Typography variant="body2" gridColumn="span 2" sx={{ 
                      color: 'text.primary', 
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      <strong>{toolData.ui.endedAt}:</strong> {chatSummary.endTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {/* Scroll to this element */}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input container */}
          <Box sx={styles.inputContainer}>
            {isChatEnded ? (
              // Show chat ended actions
              <Stack direction="row" spacing={2} width="100%" justifyContent="center">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshCw size={16} />}
                  onClick={() => {
                    trackEvent('PDF Chatbot Interaction', 'Start New Chat', 'New Chat Button');
                    handleStartNewChat();
                  }}
                >
                  {toolData.ui.newChat}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Upload size={16} />}
                  onClick={() => {
                    trackEvent('PDF Chatbot Document Interaction', 'Upload New Document', 'Upload Button');
                    handleUploadNewDocument();
                  }}
                >
                  {toolData.ui.uploadNewDocument}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Download size={16} />}
                  disabled
                >
                  {toolData.ui.downloadChat}
                </Button>
              </Stack>
            ) : (
              // Show normal chat input
              <>
                <TextField
                  variant="outlined"
                  placeholder={toolData.ui.askQuestion}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  size="small"
                  disabled={isResponding}
                  multiline
                  maxRows={3}
                  sx={styles.messageInput}
                />
                
                <Button
                  variant="contained"
                  // color="primary"
                  endIcon={isResponding ? <CircularProgress size={16} color="inherit" /> : <Send />}
                  onClick={() => {
                    trackEvent('Chat Interaction', 'Send Message', 'Send Message Button');
                    handleSendMessage();
                  }}
                  disabled={!currentMessage.trim() || isResponding}
                  sx={{
                    minWidth: { xs: '80px', sm: '100px' },
                    whiteSpace: 'nowrap',
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  {isResponding ? toolData.ui.thinking : toolData.ui.send}
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}
      
      {/* End Chat Confirmation Dialog */}
      <Dialog
        open={endChatDialogOpen}
        onClose={() => setEndChatDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: '8px',
            padding: '8px',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(240, 240, 240, 0.8)'
        }}>
          {toolData.ui.endChatTitle}
        </DialogTitle>
        <DialogContent sx={{ 
          mt: 2, 
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(40, 40, 40, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)'
        }}>
          <Typography variant="body1" sx={{ 
            color: 'text.primary',
            fontWeight: 500
          }}>
            {toolData.ui.endChatMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 2,
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(30, 30, 30, 0.95)' 
            : 'rgba(250, 250, 250, 0.95)'
        }}>
          <Button 
            onClick={() => setEndChatDialogOpen(false)} 
            sx={{ 
              color: 'text.secondary',
              borderColor: 'divider',
              bgcolor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(50, 50, 50, 0.9)' 
                : 'rgba(245, 245, 245, 0.9)',
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(60, 60, 60, 0.9)' 
                  : 'rgba(235, 235, 235, 0.9)'
              }
            }}
            variant="outlined"
          >
            {toolData.ui.cancel}
          </Button>
          <Button 
            onClick={handleEndChat} 
            color="primary" 
            variant="contained"
            sx={{
              minWidth: '100px',
              boxShadow: 2
            }}
          >
            {toolData.ui.endChat}
          </Button>
        </DialogActions>
      </Dialog>
    </ToolPage>
  );
}

export default PDFChatbot;