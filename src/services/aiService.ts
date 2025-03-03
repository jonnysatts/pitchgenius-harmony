
import { supabase } from "@/integrations/supabase/client";
import { Document, StrategicInsight, AIProcessingStatus } from "@/lib/types";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  projectId: string, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Call the Supabase Edge Function to process documents and generate insights
    const documentIds = documents.map(doc => doc.id);
    
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { projectId, documentIds }
    });
    
    if (error) {
      console.error('Error generating insights:', error);
      return { insights: [], error: error.message };
    }
    
    return { insights: data.insights || [] };
  } catch (err: any) {
    console.error('Error generating insights:', err);
    return { 
      insights: [],
      error: err.message || 'An unexpected error occurred while analyzing documents'
    };
  }
};

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
 */
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void
): () => void => {
  // In a real implementation, this would set up a subscription or polling
  // to track the processing status
  
  let cancelled = false;
  let progress = 0;
  
  const interval = setInterval(() => {
    if (cancelled) return;
    
    progress += 10;
    
    if (progress < 100) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Analyzing documents (${progress}%)`
      });
    } else {
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'Analysis complete'
      });
      clearInterval(interval);
    }
  }, 1000);
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};
