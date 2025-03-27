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
import { Send, Upload, Bot, RefreshCw, Thermometer } from 'lucide-react';
import { ToolPage } from '../../components/tools';
import { useLanguage, useToolSettings } from '../../contexts';
import { getToolTranslations } from '../../utils';
import { processPdfDocument, askOpenAI } from '../../services/apiService';
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function PDFChatbot() {
  const { language } = useLanguage();
  const toolData = getToolTranslations("pdfChatbot", language);
  
  // Get context settings instead of local state
  const { pdfChatbotSettings, updatePdfChatbotSettings, updatePdfChatbotTokenUsage } = useToolSettings();
  
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
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsResponding(true);
    
    try {
      // In a real implementation, you would call your API here to get a response
      const generator = askOpenAI(llmChatHistory, currentMessage, fileContent); 
      let fullResponce = ''
      let tokensUsed = 0
      
      for await (const chunk of generator) {  
        if (chunk.tokens_used !== undefined) {  
            console.log('Total tokens used:', chunk.tokens_used);
            tokensUsed = chunk.tokens_used;
            break;  
        } else {
            console.log(chunk.content);
            fullResponce += chunk.content;
            // responseElement.innerHTML += chunk.content;  
        }  
      }
      console.log(fullResponce);
      if (llmChatHistory[0] === '') setLlmChatHistory([{"role": 'user', "content": currentMessage}, {"role": 'assistant', "content": fullResponce}]);
      else setLlmChatHistory(prev => [...prev, {"role": 'user', "content": currentMessage}, {"role": 'assistant', "content": fullResponce}]);

      // Update token usage through context
      updatePdfChatbotTokenUsage(
        Math.min(
          pdfChatbotSettings.tokenUsage.total, 
          pdfChatbotSettings.tokenUsage.used + tokensUsed
        )
      );
      
      // Simulate bot response
      const botResponse = {
        role: 'bot',
        content: `This is a simulated response to your question about "${selectedFile?.name}". In a real implementation, this would be generated by the AI model based on the content of your PDF.`,
        timestamp: new Date()
      };
      
      // Add suggested follow-up questions if enabled
      if (pdfChatbotSettings.followupQuestions) {
        botResponse.followupQuestions = [
          "What are the key findings in the document?",
          "Can you summarize the methodology section?",
          "Who are the main authors referenced in this paper?"
        ];
      }
      
      // Add bot response to chat
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error
    } finally {
      setIsResponding(false);
    }
  };
  
  /**
   * Handle pressing Enter key to send message
   * 
   * @param {React.KeyboardEvent} event - The keyboard event
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  /**
   * Use a follow-up question suggestion
   * 
   * @param {string} question - The question to use
   */
  const handleUseFollowupQuestion = (question) => {
    setCurrentMessage(question);
  };
  
  /**
   * Estimate token usage for a message
   * 
   * @param {string} text - The message text
   * @returns {number} Estimated token count
   */
  const estimateTokenUsage = (text) => {
    // Simple estimation: approximately 4 characters per token
    return Math.ceil(text.length / 4);
  };
  
  /**
   * Reset the chat
   */
  const handleResetChat = () => {
    // Reset messages but keep the intro message
    setMessages([
      {
        role: 'bot',
        content: `I've analyzed "${selectedFile.name}". What would you like to know about this document?`,
        timestamp: new Date()
      }
    ]);
    
    // Reset token usage to 0
    updatePdfChatbotTokenUsage(0);
    
    // Alternatively, if you want to account for document analysis cost:
    // updatePdfChatbotTokenUsage(
    //   Math.floor(pdfChatbotSettings.tokenUsage.total * 0.05) // Assume 5% used for document analysis
    // );
  };

  // Calculate token percentage for the progress bar
  const tokenPercentage = (pdfChatbotSettings.tokenUsage.used / pdfChatbotSettings.tokenUsage.total) * 100;

  // Get temperature display label based on value
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
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                </Paper>
                
                {/* Follow-up question suggestions */}
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




// // ***************************************** Funcitoning Code ****************************************

// /**
//  * PDF Chatbot Tool Component
//  */
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Box, 
//   Typography, 
//   TextField, 
//   Button, 
//   Paper, 
//   Avatar,
//   IconButton,
//   CircularProgress,
//   LinearProgress,
//   Stack,
//   Chip,
//   Tooltip
// } from '@mui/material';
// import { Send, Upload, Bot, RefreshCw, Thermometer } from 'lucide-react';
// import { ToolPage } from '../../components/tools';
// import { useLanguage, useToolSettings } from '../../contexts';
// import { getToolTranslations } from '../../utils';
// import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

// export function PDFChatbot() {
//   const { language } = useLanguage();
//   const toolData = getToolTranslations("pdfChatbot", language);
  
//   // Get context settings instead of local state
//   const { pdfChatbotSettings, updatePdfChatbotSettings, updatePdfChatbotTokenUsage } = useToolSettings();
  
//   // Get styles from our styling system
//   const toolStyles = useComponentStyles('tool');
//   const styles = useComponentStyles('pdfChatbot');
  
//   // File state
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isFileProcessing, setIsFileProcessing] = useState(false);
//   const [isFileUploaded, setIsFileUploaded] = useState(false);
//   const [documentContent, setDocumentContent] = useState(""); // Store extracted document content
  
//   // Chat state
//   const [messages, setMessages] = useState([]);
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [isResponding, setIsResponding] = useState(false);
//   const [streamingResponse, setStreamingResponse] = useState('');
  
//   // Ref for scrolling to bottom of chat
//   const messagesEndRef = useRef(null);
  
//   // Scroll to bottom of chat when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
  
//   // Reset token usage on initial load
//   useEffect(() => {
//     // Reset the token usage to 0 on component mount
//     updatePdfChatbotTokenUsage(0);
//   }, []);

//   /**
//    * Handle document upload
//    * 
//    * @param {File} file - The selected file
//    */
//   const handleFileSelected = async (file) => {
//     if (!file) return;
    
//     setSelectedFile(file);
//     setIsFileProcessing(true);
    
//     try {
//       // Create a FormData object to send the file
//       const formData = new FormData();
//       formData.append('file', file);
      
//       // Call the API to extract document content
//       const response = await fetch('/di_extract_document/', {
//         method: 'POST',
//         body: formData
//       });
      
//       if (!response.ok) {
//         throw new Error(`Error processing file: ${response.statusText}`);
//       }
      
//       const data = await response.json();
      
//       // Store the extracted document content
//       setDocumentContent(data.extracted_document);
      
//       // Reset messages when new file is uploaded
//       setMessages([
//         {
//           role: 'bot',
//           content: `I've analyzed "${file.name}". What would you like to know about this document?`,
//           timestamp: new Date()
//         }
//       ]);
      
//       // Reset token usage for new file through context
//       updatePdfChatbotTokenUsage(0, getTokenLimitForModel(pdfChatbotSettings.modelType));
      
//       setIsFileUploaded(true);
//     } catch (error) {
//       console.error('Error processing file:', error);
//       // Add error message to chat
//       setMessages([
//         {
//           role: 'bot',
//           content: `Error processing file: ${error.message}. Please try again.`,
//           timestamp: new Date()
//         }
//       ]);
//     } finally {
//       setIsFileProcessing(false);
//     }
//   };
  
//   /**
//    * Get token limit based on model type
//    * 
//    * @param {string} modelType - The model type
//    * @returns {number} The token limit
//    */
//   const getTokenLimitForModel = (modelType) => {
//     switch (modelType) {
//       case 'gpt4o':
//         return 128000;
//       case 'gpt4omini':
//         return 100000;
//       case 'gpt35':
//         return 16000;
//       default:
//         return 100000;
//     }
//   };
  
//   /**
//    * Maps frontend model type to API model name
//    * 
//    * @param {string} modelType - The frontend model type
//    * @returns {string} The API model name
//    */
//   const getApiModelName = (modelType) => {
//     switch (modelType) {
//       case 'gpt4o':
//         return 'gpt-4o';
//       case 'gpt4omini':
//         return 'gpt-4o-mini';
//       case 'gpt35':
//         return 'gpt-3.5';
//       default:
//         return 'gpt-4o-mini';
//     }
//   };
  
//   /**
//    * Handle sending a message
//    */
//   const handleSendMessage = async () => {
//     if (!currentMessage.trim()) return;
    
//     const userMessage = {
//       role: 'user',
//       content: currentMessage,
//       timestamp: new Date()
//     };
    
//     // Add user message to chat
//     setMessages(prev => [...prev, userMessage]);
//     setCurrentMessage('');
//     setIsResponding(true);
//     setStreamingResponse(''); // Reset streaming response
    
//     try {
//       // Format chat history for the API
//       const chatHistory = messages.map(msg => ({
//         role: msg.role === 'user' ? 'user' : 'assistant',
//         content: msg.content
//       }));
      
//       // Add the new user message
//       chatHistory.push({
//         role: 'user',
//         content: userMessage.content
//       });
      
//       // Call the API to get a streaming response
//       const response = await fetch('/openai_question/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           chat_history: chatHistory,
//           document: documentContent,
//           model: getApiModelName(pdfChatbotSettings.modelType),
//           tempurature: pdfChatbotSettings.temperature,
//           reasoning_effort: "high"
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`Error getting response: ${response.statusText}`);
//       }
      
//       // Handle the streaming response
//       const reader = response.body.getReader();
//       let accumulatedResponse = '';
//       let tokensUsed = 0;
      
//       // Process the stream
//       while (true) {
//         const { done, value } = await reader.read();
        
//         if (done) break;
        
//         // Convert the chunk to text
//         const chunk = new TextDecoder().decode(value);
        
//         // Process each line in the chunk
//         const lines = chunk.split('\n\n');
        
//         for (const line of lines) {
//           if (line.startsWith('data: ')) {
//             try {
//               const data = JSON.parse(line.substring(6));
              
//               if (data.content) {
//                 accumulatedResponse += data.content;
//                 setStreamingResponse(accumulatedResponse);
//               }
              
//               if (data.tokens_used && !tokensUsed) {
//                 tokensUsed = data.tokens_used;
//               }
              
//               if (data.finish_reason === 'stop') {
//                 // Streaming complete
//                 finishStreaming(accumulatedResponse, tokensUsed);
//               }
//             } catch (e) {
//               console.error('Error parsing stream data', e);
//             }
//           }
//         }
//       }
      
//       // In case the finish_reason wasn't received
//       if (accumulatedResponse) {
//         finishStreaming(accumulatedResponse, tokensUsed);
//       }
      
//     } catch (error) {
//       console.error('Error sending message:', error);
      
//       // Add error message to chat
//       setMessages(prev => [...prev, {
//         role: 'bot',
//         content: `Error: ${error.message}. Please try again.`,
//         timestamp: new Date()
//       }]);
      
//       setIsResponding(false);
//     }
//   };
  
//   /**
//    * Finish processing the streaming response
//    * 
//    * @param {string} responseText - The complete response text
//    * @param {number} tokensUsed - The number of tokens used
//    */
//   const finishStreaming = (responseText, tokensUsed) => {
//     // Add bot response to chat
//     setMessages(prev => [...prev, {
//       role: 'bot',
//       content: responseText,
//       timestamp: new Date()
//     }]);
    
//     // Update token usage
//     updatePdfChatbotTokenUsage(
//       Math.min(
//         pdfChatbotSettings.tokenUsage.total, 
//         pdfChatbotSettings.tokenUsage.used + tokensUsed
//       )
//     );
    
//     setIsResponding(false);
//     setStreamingResponse('');
//   };
  
//   /**
//    * Handle pressing Enter key to send message
//    * 
//    * @param {React.KeyboardEvent} event - The keyboard event
//    */
//   const handleKeyPress = (event) => {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };
  
//   /**
//    * Use a follow-up question suggestion
//    * 
//    * @param {string} question - The question to use
//    */
//   const handleUseFollowupQuestion = (question) => {
//     setCurrentMessage(question);
//   };
  
//   /**
//    * Reset the chat
//    */
//   const handleResetChat = () => {
//     // Reset messages but keep the intro message
//     setMessages([
//       {
//         role: 'bot',
//         content: `I've analyzed "${selectedFile.name}". What would you like to know about this document?`,
//         timestamp: new Date()
//       }
//     ]);
    
//     // Reset token usage to 0
//     updatePdfChatbotTokenUsage(0);
//   };

//   // Calculate token percentage for the progress bar
//   const tokenPercentage = (pdfChatbotSettings.tokenUsage.used / pdfChatbotSettings.tokenUsage.total) * 100;

//   // Get temperature display label based on value
//   const getTemperatureLabel = (value) => {
//     if (value <= 0.3) return "Precise";
//     if (value <= 0.7) return "Balanced";
//     return "Creative";
//   };

//   return (
//     <ToolPage
//       title={toolData.title}
//       shortDescription={toolData.shortDescription}
//       longDescription={toolData.longDescription}
//       backgroundImage="/assets/robot.png"
//       actionButtonText={isFileUploaded ? "Upload New Document" : toolData.actionButtonText}
//       onFileSelected={handleFileSelected}
//       isProcessing={isFileProcessing}
//       containerSx={toolStyles.container}
//     >
//       {/* Chat interface appears only when a file is uploaded */}
//       {isFileUploaded && (
//         <Box sx={styles.chatContainer}>
//           {/* Chat header with file info and token usage */}
//           <Box sx={styles.chatHeader}>
//             <Box sx={styles.pdfInfo}>
//               <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
//                 <Bot size={18} />
//               </Avatar>
//               <Typography variant="body2" fontWeight={500}>
//                 {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
//               </Typography>
//             </Box>
            
//             {/* Token usage display */}
//             <Box sx={styles.tokenStatusContainer}>
//               {/* Temperature indicator */}
//               <Tooltip title="Current temperature setting">
//                 <Chip
//                   icon={<Thermometer size={14} />}
//                   label={`${pdfChatbotSettings.temperature.toFixed(1)} - ${getTemperatureLabel(pdfChatbotSettings.temperature)}`}
//                   size="small"
//                   variant="outlined"
//                   sx={styles.temperatureChip}
//                 />
//               </Tooltip>
              
//               {/* Token usage counter */}
//               <Tooltip title="Token usage">
//                 <Box sx={styles.tokenCounter}>
//                   <Typography variant="caption" sx={styles.tokenText}>
//                     {pdfChatbotSettings.tokenUsage.used.toLocaleString()} / {pdfChatbotSettings.tokenUsage.total.toLocaleString()}
//                   </Typography>
//                 </Box>
//               </Tooltip>
              
//               {/* Reset button */}
//               <Tooltip title="Reset chat">
//                 <IconButton 
//                   size="small" 
//                   onClick={handleResetChat}
//                   disabled={isResponding}
//                   sx={styles.resetButton}
//                 >
//                   <RefreshCw size={16} />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           </Box>
          
//           {/* Token usage progress bar */}
//           <LinearProgress 
//             variant="determinate" 
//             value={tokenPercentage} 
//             sx={{
//               ...styles.tokenProgressBar, 
//               props: { percentage: tokenPercentage }
//             }}
//           />
          
//           {/* Remaining tokens display */}
//           <Box sx={styles.remainingTokensContainer}>
//             <Typography variant="caption" sx={styles.remainingTokensText}>
//               {(pdfChatbotSettings.tokenUsage.total - pdfChatbotSettings.tokenUsage.used).toLocaleString()} tokens remaining
//             </Typography>
//           </Box>
          
//           {/* Messages container */}
//           <Box sx={styles.messagesContainer}>
//             {messages.map((message, index) => (
//               <Box key={index}>
//                 <Paper 
//                   elevation={0} 
//                   sx={message.role === 'user' ? styles.userMessage : styles.botMessage}
//                 >
//                   <Typography variant="body2">
//                     {message.content}
//                   </Typography>
//                 </Paper>
                
//                 {/* Follow-up question suggestions */}
//                 {message.role === 'bot' && message.followupQuestions && (
//                   <Stack direction="column" spacing={1} sx={{ mt: 1, ml: 1 }}>
//                     <Typography variant="caption" color="text.secondary">
//                       Suggested questions:
//                     </Typography>
                    
//                     {message.followupQuestions.map((question, qIndex) => (
//                       <Typography 
//                         key={qIndex} 
//                         variant="body2"
//                         onClick={() => handleUseFollowupQuestion(question)}
//                         sx={styles.followupQuestion}
//                       >
//                         {question}
//                       </Typography>
//                     ))}
//                   </Stack>
//                 )}
//               </Box>
//             ))}
            
//             {/* Streaming response */}
//             {isResponding && streamingResponse && (
//               <Paper elevation={0} sx={styles.botMessage}>
//                 <Typography variant="body2">
//                   {streamingResponse}
//                 </Typography>
//               </Paper>
//             )}
            
//             {/* Loading indicator when no streaming response yet */}
//             {isResponding && !streamingResponse && (
//               <Paper elevation={0} sx={styles.botMessage}>
//                 <CircularProgress size={16} sx={{ mr: 1 }} />
//                 <Typography variant="body2">Thinking...</Typography>
//               </Paper>
//             )}
            
//             {/* Scroll to this element */}
//             <div ref={messagesEndRef} />
//           </Box>
          
//           {/* Input container */}
//           <Box sx={styles.inputContainer}>
//             <TextField
//               variant="outlined"
//               placeholder="Ask a question about the document..."
//               value={currentMessage}
//               onChange={(e) => setCurrentMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               fullWidth
//               size="small"
//               disabled={isResponding}
//               multiline
//               maxRows={3}
//               sx={styles.messageInput}
//             />
            
//             <Button
//               variant="contained"
//               color="primary"
//               endIcon={isResponding ? <CircularProgress size={16} color="inherit" /> : <Send />}
//               onClick={handleSendMessage}
//               disabled={!currentMessage.trim() || isResponding}
//             >
//               {isResponding ? "Thinking..." : "Send"}
//             </Button>
//           </Box>
//         </Box>
//       )}
//     </ToolPage>
//   );
// }

// export default PDFChatbot;