
/**
 * Tracking and monitoring of AI processing status
 */
import { AIProcessingStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

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
  
  // Immediately update status to show we're starting
  onStatusUpdate({
    status: 'processing',
    progress: 0,
    message: 'Starting document analysis...'
  });
  
  // This simulates the AI processing progress
  // In a production app, this would connect to a real-time status endpoint
  interval = setInterval(() => {
    if (cancelled) {
      if (interval) clearInterval(interval);
      return;
    }
    
    // Slow down the progress bar for more realistic Claude timing (up to 2 minutes)
    // Claude needs more time, so we'll make the progress bar move slower
    
    // Simulate different phases of processing with appropriate messages
    if (progress < 10) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Preparing documents for Claude AI...`
      });
    } else if (progress < 20) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Extracting text from all documents...`
      });
    } else if (progress < 30) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Sending documents to Claude AI...`
      });
    } else if (progress < 60) {
      // This is the main Claude processing phase - spend most time here
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Claude AI is analyzing documents (this may take up to 2 minutes)...`
      });
    } else if (progress < 75) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Claude AI is generating strategic insights...`
      });
    } else if (progress < 90) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Processing AI-generated insights...`
      });
    } else if (progress < 98) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Finalizing comprehensive insights...`
      });
    } else if (progress < 100) {
      onStatusUpdate({
        status: 'finalizing',
        progress: 99,
        message: 'Preparing insights for display...'
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
        // Add a delay to ensure the insights have been properly loaded
        // before transitioning to the insights tab
        setTimeout(() => {
          onCompletionCallback();
        }, 1500);
      }
      
      // Clear the interval after sending the status update
      if (interval) clearInterval(interval);
      interval = null;
    }
    
    // Make the progress much slower to accommodate the 2-minute Claude processing time
    if (progress < 30) {
      // Initial stages move at moderate speed
      progress += Math.random() * 2 + 0.5;
    } else if (progress < 60) {
      // Claude processing stage (moves very slowly)
      progress += Math.random() * 0.5 + 0.1;
    } else if (progress < 90) {
      // Processing insights (moderate speed)
      progress += Math.random() * 1 + 0.3;
    } else {
      // Final stages (slow)
      progress += Math.random() * 0.3 + 0.1;
    }
    
    // Don't let progress exceed 100
    if (progress > 100) progress = 100;
  }, 1000); // Update every second
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
  };
};

/**
 * Monitor the progress of website analysis specifically
 * This provides real-time feedback during website content analysis
 */
export const monitorWebsiteAnalysisProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void,
  onCompletionCallback?: () => void
): () => void => {
  let cancelled = false;
  let progress = 0;
  let interval: NodeJS.Timeout | null = null;
  
  // Immediately show initial toast notification
  toast({
    title: "Website Analysis Started",
    description: "Getting ready to analyze website content...",
    duration: 3000,
  });
  
  // Immediately update status to show we're starting
  onStatusUpdate({
    status: 'processing',
    progress: 0,
    message: 'Starting website analysis...'
  });
  
  interval = setInterval(() => {
    if (cancelled) {
      if (interval) clearInterval(interval);
      return;
    }
    
    // Simulate different phases of website analysis with appropriate messages
    if (progress < 10) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Preparing to fetch website content...`
      });
    } else if (progress < 25) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Crawling website pages...`
      });
      
      // Show a toast at this stage to reinforce the progress
      if (progress > 15 && progress < 16) { // Only show once in this range
        toast({
          title: "Website Crawling",
          description: "Fetching content from multiple pages. This may take a minute...",
          duration: 4000,
        });
      }
    } else if (progress < 40) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Extracting website content and structure...`
      });
    } else if (progress < 60) {
      // Claude processing phase
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Claude AI is analyzing website data (this may take 1-2 minutes)...`
      });
      
      // Show another toast midway through Claude analysis
      if (progress > 50 && progress < 51) { // Only show once in this range
        toast({
          title: "AI Analysis In Progress",
          description: "Claude is processing your website data. This is the longest step...",
          duration: 5000,
        });
      }
    } else if (progress < 80) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Generating strategic insights for your website...`
      });
    } else if (progress < 95) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Finalizing website analysis results...`
      });
    } else if (progress < 100) {
      onStatusUpdate({
        status: 'finalizing',
        progress: 99,
        message: 'Preparing website insights for display...'
      });
    } else {
      // When we reach 100%, update status to completed and trigger callback
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'Website analysis complete!'
      });
      
      // Show completion toast
      toast({
        title: "Analysis Complete",
        description: "Website insights have been generated successfully!",
        duration: 4000,
      });
      
      // Call the completion callback if provided
      if (onCompletionCallback) {
        setTimeout(() => {
          onCompletionCallback();
        }, 1000);
      }
      
      // Clear the interval
      if (interval) clearInterval(interval);
      interval = null;
    }
    
    // Control the progress speed to make feedback more realistic
    if (progress < 20) {
      // Initial website fetching (moderate speed)
      progress += Math.random() * 2.5 + 1;
    } else if (progress < 40) {
      // Content extraction (moderate speed)
      progress += Math.random() * 1.5 + 0.5;
    } else if (progress < 60) {
      // Claude processing stage (very slow)
      progress += Math.random() * 0.3 + 0.1;
    } else if (progress < 90) {
      // Insight generation (moderate speed)
      progress += Math.random() * 1 + 0.3;
    } else {
      // Final stages (slow)
      progress += Math.random() * 0.5 + 0.1;
    }
    
    // Cap progress at 100
    if (progress > 100) progress = 100;
  }, 800); // Update slightly faster than document analysis (800ms vs 1000ms)
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
  };
};
