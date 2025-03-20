/**
 * useFileUpload Hook
 * 
 * A custom hook that handles file uploads, processing, and reset functionality.
 * This hook standardizes file handling across tool components, providing:
 * 
 * 1. Upload state management (processing state)
 * 2. Error handling
 * 3. Automatic input reset to allow re-uploading the same file
 * 4. Optional success/error callbacks
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Hook for managing file uploads with automatic reset capability
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.processFile - Function that processes the file (required)
 * @param {Function} [options.onSuccess] - Callback function called on successful processing
 * @param {Function} [options.onError] - Callback function called on processing error
 * @param {boolean} [options.resetOnSuccess=true] - Whether to reset input after successful upload
 * @param {boolean} [options.resetOnError=true] - Whether to reset input after upload error
 * @param {boolean} [options.rethrowErrors=true] - Whether to rethrow errors (set to false to prevent "Uncaught" errors in UI)
 * @returns {Object} Hook state and handlers
 */
export function useFileUpload({
  processFile,
  onSuccess,
  onError,
  resetOnSuccess = true,
  resetOnError = true,
  rethrowErrors = true
}) {
  // Track processing state to disable UI during file operations
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Key used to force re-rendering of components
  const [uploadKey, setUploadKey] = useState(() => Date.now());
  
  // Track the last processed result
  const [lastResult, setLastResult] = useState(null);
  
  // Track any errors that occurred
  const [error, setError] = useState(null);

  /**
   * Reset the file input to allow uploading the same file again
   * This changes the uploadKey which forces React to re-render the input
   */
  const resetFileInput = useCallback(() => {
    setUploadKey(Date.now());
  }, []);

  /**
   * Handle file selection and processing
   * 
   * @param {File} file - The file to process
   * @returns {Promise<any>} The processing result
   */
  const handleFileSelected = useCallback(async (file) => {
    if (!file) return;
    
    // Clear previous errors and results
    setError(null);
    
    // Set processing state to show loading indicators
    setIsProcessing(true);
    
    try {
      // Process the file using the provided function
      const result = await processFile(file);
      
      // Store the result
      setLastResult(result);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset input if configured to do so
      if (resetOnSuccess) {
        resetFileInput();
      }
      
      return result;
    } catch (err) {
      // Store and log the error
      console.error('Error processing file:', err);
      setError(err);
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      // Reset input on error if configured to do so
      if (resetOnError) {
        resetFileInput();
      }
      
      // Only rethrow if configured to do so
      if (rethrowErrors) {
        throw err;
      }
      
      return null; // Return null to indicate error
    } finally {
      // Ensure processing state is reset
      setIsProcessing(false);
    }
  }, [processFile, onSuccess, onError, resetOnSuccess, resetOnError, resetFileInput]);

  return {
    isProcessing,      // Boolean flag indicating if a file is being processed
    uploadKey,         // Key to force re-rendering of file inputs
    lastResult,        // Last successful processing result
    error,             // Last error if any
    handleFileSelected, // Function to handle file selection
    resetFileInput     // Function to manually reset the file input
  };
}

export default useFileUpload;