
/**
 * Tracking and monitoring of AI processing status
 */
import { AIProcessingStatus } from "@/lib/types";

/**
 * Get the current status of AI processing
 */
export const getAIProcessingStatus = (projectId: string): AIProcessingStatus => {
  // This would typically be fetched from the server
  // For now, we'll use a mock implementation
  return {
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze documents'
  };
};

/**
 * Monitor the progress of AI document processing
 * In a real implementation, this would poll a database or use websockets
 */
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void,
  onCompletionCallback?: () => void
): () => void => {
  let cancelled = false;
  let progress = 0;
  let interval: NodeJS.Timeout | null = null;
  
  // This simulates the AI processing progress
  // In a production app, this would connect to a real-time status endpoint
  interval = setInterval(() => {
    if (cancelled) {
      if (interval) clearInterval(interval);
      return;
    }
    
    // Simulate different phases of processing with appropriate messages
    if (progress < 15) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Extracting text from all documents...`
      });
    } else if (progress < 30) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Analyzing document relationships...`
      });
    } else if (progress < 45) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Analyzing business context...`
      });
    } else if (progress < 60) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Identifying gaming opportunities...`
      });
    } else if (progress < 75) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Connecting to Anthropic API...`
      });
    } else if (progress < 90) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Processing AI-generated insights...`
      });
    } else if (progress < 99) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Finalizing comprehensive insights...`
      });
    } else {
      // When we reach 100%, update status to completed and trigger callback
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'AI analysis complete!'
      });
      
      // Call the completion callback if provided
      if (onCompletionCallback) {
        // Add a small delay to ensure UI updates before callback
        setTimeout(() => {
          onCompletionCallback();
        }, 500);
      }
      
      // Clear the interval after sending the status update
      if (interval) clearInterval(interval);
      interval = null;
    }
    
    // Slow down the progress a bit to reflect real API processing time
    // Don't let progress exceed 100
    progress += Math.random() * 4 + 1;
    if (progress > 100) progress = 100;
  }, 800);
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
  };
};
