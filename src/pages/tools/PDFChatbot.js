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
  Tooltip
} from '@mui/material';
import { Send, Bot, RefreshCw, Thermometer } from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { processPdfDocument, askOpenAI } from '../../services/apiService';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function PDFChatbot() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("pdfChatbot", language);
  
  // Get context settings from ToolSettingsContext
  const { pdfChatbotSettings, updatePdfChatbotTokenUsage } = useToolSettings();
  
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
  
  // Ref for scrolling to bottom of chat
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Reset token usage on initial load
  useEffect(() => {
    // Reset the token usage to 0 on component mount
    updatePdfChatbotTokenUsage(0);
  }, []);

  /**
   * Handle document upload
   * 
   * @param {File} file - The selected file
   */
  const handleFileSelected = async (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    setIsFileProcessing(true);
    
    try {
      const response = await processPdfDocument(file);
      setFileContent(response.extracted_document);
      
      // Reset messages when new file is uploaded
      setMessages([
        {
          role: 'bot',
          content: `I've analyzed "${file.name}". What would you like to know about this document?`,
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
    
    // Split the content if the marker exists.
    const marker = "Source Page:";
    const markerIndex = content.lastIndexOf(marker);
    if (markerIndex !== -1) {
      const mainContent = content.substring(0, markerIndex).trim();
      const sourceContent = content.substring(markerIndex).trim();
      return (
        <div>
          <div dangerouslySetInnerHTML={{ __html: mainContent }} />
          <Typography variant="caption" sx={{ display: 'block', marginTop: '8px', color: 'grey' }}>
            {sourceContent}
          </Typography>
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  /**
   * Handle sending a message with live stream updates.
   */
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    // Append the user message.
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsResponding(true);
    
    // Create a temporary assistant message for live updates.
    const tempResponse = { role: 'assistant', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, tempResponse]);
    
    try {
      const generator = askOpenAI(llmChatHistory, currentMessage, fileContent);
      let tokensUsed = 0;
      
      // Process stream: update live as chunks arrive.
      for await (const chunk of generator) {
        if (chunk.content) {
          // Append the chunk's content.
          tempResponse.content += chunk.content;
          // Update the last message in the state to trigger re-render.
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...tempResponse };
            return newMessages;
          });
        }
        
        // Break when finish reason is provided.
        if (chunk.finish_reason !== undefined && chunk.finish_reason !== null) {
          tokensUsed = chunk.tokens_used;
          break;
        }
      }
      
      // Update LLM chat history.
      if (llmChatHistory[0] === '') {
        setLlmChatHistory([{ role: 'user', content: currentMessage }, { role: 'assistant', content: tempResponse.content }]);
      } else {
        setLlmChatHistory(prev => [...prev, { role: 'user', content: currentMessage }, { role: 'assistant', content: tempResponse.content }]);
      }
      
      updatePdfChatbotTokenUsage(
        Math.min(
          pdfChatbotSettings.tokenUsage.total, 
          pdfChatbotSettings.tokenUsage.used + tokensUsed
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
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
    setMessages([
      {
        role: 'bot',
        content: `I've analyzed "${selectedFile.name}". What would you like to know about this document?`,
        timestamp: new Date()
      }
    ]);
    updatePdfChatbotTokenUsage(0);
  };

  const tokenPercentage = (pdfChatbotSettings.tokenUsage.used / pdfChatbotSettings.tokenUsage.total) * 100;

  const getTemperatureLabel = (value) => {
    if (value <= 0.3) return "Precise";
    if (value <= 0.7) return "Balanced";
    return "Creative";
  };

  return (
    <ToolPage
      title={toolData.title}
      shortDescription={toolData.shortDescription}
      longDescription={toolData.longDescription}
      backgroundImage="/assets/robot.png"
      actionButtonText={isFileUploaded ? "Upload New Document" : toolData.actionButtonText}
      onFileSelected={handleFileSelected}
      isProcessing={isFileProcessing}
      containerSx={toolStyles.container}
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
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
            </Box>
            
            {/* Token usage display */}
            <Box sx={styles.tokenStatusContainer}>
              {/* Temperature indicator */}
              <Tooltip title="Current temperature setting">
                <Chip
                  icon={<Thermometer size={14} />}
                  label={`${pdfChatbotSettings.temperature.toFixed(1)} - ${getTemperatureLabel(pdfChatbotSettings.temperature)}`}
                  size="small"
                  variant="outlined"
                  sx={styles.temperatureChip}
                />
              </Tooltip>
              
              {/* Token usage counter */}
              <Tooltip title="Token usage">
                <Box sx={styles.tokenCounter}>
                  <Typography variant="caption" sx={styles.tokenText}>
                    {pdfChatbotSettings.tokenUsage.used.toLocaleString()} / {pdfChatbotSettings.tokenUsage.total.toLocaleString()}
                  </Typography>
                </Box>
              </Tooltip>
              
              {/* Reset button */}
              <Tooltip title="Reset chat">
                <IconButton 
                  size="small" 
                  onClick={handleResetChat}
                  disabled={isResponding}
                  sx={styles.resetButton}
                >
                  <RefreshCw size={16} />
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
              props: { percentage: tokenPercentage }
            }}
          />
          
          {/* Remaining tokens display */}
          <Box sx={styles.remainingTokensContainer}>
            <Typography variant="caption" sx={styles.remainingTokensText}>
              {(pdfChatbotSettings.tokenUsage.total - pdfChatbotSettings.tokenUsage.used).toLocaleString()} tokens remaining
            </Typography>
          </Box>
          
          {/* Messages container */}
          <Box sx={styles.messagesContainer}>
            {messages.map((message, index) => (
              <Box key={index}>
                <Paper 
                  elevation={0} 
                  sx={message.role === 'user' ? styles.userMessage : styles.botMessage}
                >
                  {message.role === 'assistant' ? (
                    renderAssistantMessage(message)
                  ) : (
                    <Typography variant="body2">{message.content}</Typography>
                  )}
                </Paper>
                
                {message.role === 'bot' && message.followupQuestions && (
                  <Stack direction="column" spacing={1} sx={{ mt: 1, ml: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Suggested questions:
                    </Typography>
                    
                    {message.followupQuestions.map((question, qIndex) => (
                      <Typography 
                        key={qIndex} 
                        variant="body2"
                        onClick={() => handleUseFollowupQuestion(question)}
                        sx={styles.followupQuestion}
                      >
                        {question}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
            
            {/* Scroll to this element */}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input container */}
          <Box sx={styles.inputContainer}>
            <TextField
              variant="outlined"
              placeholder="Ask a question about the document..."
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
              color="primary"
              endIcon={isResponding ? <CircularProgress size={16} color="inherit" /> : <Send />}
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isResponding}
            >
              {isResponding ? "Thinking..." : "Send"}
            </Button>
          </Box>
        </Box>
      )}
    </ToolPage>
  );
}

export default PDFChatbot;
