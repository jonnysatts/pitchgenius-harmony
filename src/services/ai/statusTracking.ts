
import { AIProcessingStatus } from '@/lib/types';

/**
 * Monitor AI processing progress with completion callback
 */
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void,
  onCompletionCallback?: () => void
): (() => void) => {
  let isCancelled = false;
  let currentStep = 0;
  const totalSteps = 10;
  const intervalTime = 2500; // Time between updates in ms
  
  const updateStatus = (step: number, message: string, statusType: 'processing' | 'completed' | 'error' = 'processing') => {
    if (isCancelled) return;
    
    const progress = Math.min(Math.round((step / totalSteps) * 100), 100);
    
    onStatusUpdate({
      status: statusType,
      progress,
      message
    });
  };
  
  // Simulate processing steps
  const processingInterval = setInterval(() => {
    if (isCancelled) {
      clearInterval(processingInterval);
      return;
    }
    
    currentStep++;
    
    // Update the status message based on the current step
    switch(currentStep) {
      case 1:
        updateStatus(currentStep, 'Initializing document analysis...');
        break;
      case 2:
        updateStatus(currentStep, 'Processing document content...');
        break;
      case 3:
        updateStatus(currentStep, 'Extracting key information...');
        break;
      case 4:
        updateStatus(currentStep, 'Analyzing industry context...');
        break;
      case 5:
        updateStatus(currentStep, 'Identifying strategic opportunities...');
        break;
      case 6:
        updateStatus(currentStep, 'Developing audience insights...');
        break;
      case 7:
        updateStatus(currentStep, 'Formulating recommendations...');
        break;
      case 8:
        updateStatus(currentStep, 'Prioritizing actionable insights...');
        break;
      case 9:
        updateStatus(currentStep, 'Finalizing analysis results...');
        break;
      case 10:
        updateStatus(currentStep, 'Analysis complete!', 'completed');
        clearInterval(processingInterval);
        
        // Call the completion callback after a short delay
        if (onCompletionCallback) {
          setTimeout(() => {
            if (!isCancelled) {
              onCompletionCallback();
            }
          }, 1000);
        }
        break;
      default:
        break;
    }
  }, intervalTime);
  
  // Return a function to cancel the monitoring
  return () => {
    isCancelled = true;
    clearInterval(processingInterval);
  };
};

/**
 * Monitor website analysis progress with completion callback
 * Similar to the document analysis but with website-specific steps
 */
export const monitorWebsiteAnalysisProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void,
  onCompletionCallback?: () => void
): (() => void) => {
  let isCancelled = false;
  let currentStep = 0;
  const totalSteps = 10;
  const intervalTime = 2500; // Time between updates in ms
  
  const updateStatus = (step: number, message: string, statusType: 'processing' | 'completed' | 'error' = 'processing') => {
    if (isCancelled) return;
    
    const progress = Math.min(Math.round((step / totalSteps) * 100), 100);
    
    onStatusUpdate({
      status: statusType,
      progress,
      message
    });
  };
  
  // Simulate processing steps with website-specific messaging
  const processingInterval = setInterval(() => {
    if (isCancelled) {
      clearInterval(processingInterval);
      return;
    }
    
    currentStep++;
    
    // Update the status message based on the current step
    switch(currentStep) {
      case 1:
        updateStatus(currentStep, 'Initializing website analysis...');
        break;
      case 2:
        updateStatus(currentStep, 'Crawling website content...');
        break;
      case 3:
        updateStatus(currentStep, 'Extracting key business information...');
        break;
      case 4:
        updateStatus(currentStep, 'Analyzing industry context...');
        break;
      case 5:
        updateStatus(currentStep, 'Identifying business imperatives...');
        break;
      case 6:
        updateStatus(currentStep, 'Evaluating gaming audience opportunities...');
        break;
      case 7:
        updateStatus(currentStep, 'Developing strategic activation pathways...');
        break;
      case 8:
        updateStatus(currentStep, 'Formulating engagement recommendations...');
        break;
      case 9:
        updateStatus(currentStep, 'Finalizing strategic insights...');
        break;
      case 10:
        updateStatus(currentStep, 'Analysis complete!', 'completed');
        clearInterval(processingInterval);
        
        // Call the completion callback after a short delay
        if (onCompletionCallback) {
          setTimeout(() => {
            if (!isCancelled) {
              onCompletionCallback();
            }
          }, 1000);
        }
        break;
      default:
        break;
    }
  }, intervalTime);
  
  // Return a function to cancel the monitoring
  return () => {
    isCancelled = true;
    clearInterval(processingInterval);
  };
};
