
import { supabase } from "@/integrations/supabase/client";
import { Document, StrategicInsight, AIProcessingStatus, Project } from "@/lib/types";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Call the Supabase Edge Function to process documents and generate insights
    const documentIds = documents.map(doc => doc.id);
    
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { 
        projectId: project.id, 
        documentIds,
        clientIndustry: project.clientIndustry 
      }
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
 * In a real implementation, this would poll a database or use websockets
 */
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void
): () => void => {
  let cancelled = false;
  let progress = 0;
  
  // This simulates the AI processing progress
  // In a production app, this would connect to a real-time status endpoint
  const interval = setInterval(() => {
    if (cancelled) return;
    
    // Simulate different phases of processing with appropriate messages
    if (progress < 20) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Extracting text from documents...`
      });
    } else if (progress < 40) {
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
    } else if (progress < 80) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Generating strategic recommendations...`
      });
    } else if (progress < 100) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Finalizing insights...`
      });
    } else {
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'Analysis complete!'
      });
      clearInterval(interval);
    }
    
    progress += 5;
    
    if (progress > 100) {
      clearInterval(interval);
    }
  }, 600); // Update every 600ms for a smoother progress animation
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

/**
 * Calculate the overall confidence score for insights
 * @returns A number between 0-100 representing average confidence
 */
export const calculateOverallConfidence = (insights: StrategicInsight[]): number => {
  if (!insights.length) return 0;
  
  const total = insights.reduce((sum, insight) => sum + insight.confidence, 0);
  return Math.round(total / insights.length);
};

/**
 * Count insights that need review (low confidence)
 */
export const countInsightsNeedingReview = (insights: StrategicInsight[]): number => {
  return insights.filter(insight => insight.needsReview).length;
};
