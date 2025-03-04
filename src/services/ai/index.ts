
import { analyzeDocuments } from "./insightGenerator";
import { prepareDocumentContents } from "./promptUtils";
import { callClaudeApi, checkSupabaseConnection } from "./apiClient";
import { Document, Project, StrategicInsight } from "@/lib/types";

/**
 * Generate insights from documents using Claude API
 */
export const generateInsights = async (
  project: Project,
  documents: Document[]
): Promise<{
  insights: StrategicInsight[],
  error?: string,
  insufficientContent?: boolean
}> => {
  try {
    console.log(`Generating insights for project: ${project.id} with ${documents.length} documents`);
    
    // Prepare document contents
    const documentContents = prepareDocumentContents(documents);
    
    // Call the Claude API
    const result = await callClaudeApi(project, documents, documentContents);
    
    return result;
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      insights: [],
      error: `Failed to generate insights: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Add monitoring functions for AI processing progress
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: any) => void,
  onComplete: () => void
): () => void => {
  console.log(`Setting up monitoring for project ${projectId}`);
  
  // Simple implementation - in a real app this might poll a database
  // or connect to a websocket for real-time updates
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    
    onStatusUpdate({
      status: progress >= 100 ? 'completed' : 'processing',
      progress: Math.min(progress, 100),
      message: progress >= 100 
        ? 'Analysis complete' 
        : `Processing documents (${progress}%)`
    });
    
    if (progress >= 100) {
      clearInterval(interval);
      onComplete();
    }
  }, 1000);
  
  // Return a cleanup function
  return () => clearInterval(interval);
};

// Add monitoring for website analysis
export const monitorWebsiteAnalysisProgress = (
  projectId: string,
  onStatusUpdate: (status: any) => void,
  onComplete: () => void
): () => void => {
  console.log(`Setting up website analysis monitoring for project ${projectId}`);
  
  // Similar implementation to document analysis monitoring
  let progress = 0;
  const interval = setInterval(() => {
    progress += 8; // Slightly slower than document analysis
    
    onStatusUpdate({
      status: progress >= 100 ? 'completed' : 'processing',
      progress: Math.min(progress, 100),
      message: progress >= 100 
        ? 'Website analysis complete' 
        : `Analyzing website (${progress}%)`
    });
    
    if (progress >= 100) {
      clearInterval(interval);
      onComplete();
    }
  }, 1000);
  
  // Return a cleanup function
  return () => clearInterval(interval);
};

// Re-export other AI service functions
export { checkSupabaseConnection } from "./apiClient";
