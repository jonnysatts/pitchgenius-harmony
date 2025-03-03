
/**
 * Generation of strategic insights using AI
 */
import { Document, StrategicInsight, Project } from "@/lib/types";
import { checkSupabaseConnection } from "./config";
import { generateComprehensiveInsights } from "./mockGenerator";
import { callClaudeApi, createTimeoutPromise } from "./apiClient";
import { prepareDocumentContents } from "./promptEngineering";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    console.log(`Processing ${documents.length} documents for project ${project.id}`);
    
    // Prepare document contents
    const documentContents = prepareDocumentContents(documents, project);

    // Check if we're in development mode without Supabase or if Supabase connection failed
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock insights generator');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Using sample insights - no Supabase connection available"
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to generate insights');
    
    // Create a timeout promise - 120 seconds (2 minutes)
    const timeoutPromise = createTimeoutPromise(project, documents, 120000);
    
    try {
      // Race between the actual API call and the timeout
      return await Promise.race([
        callClaudeApi(project, documents, documentContents),
        timeoutPromise
      ]);
    } catch (apiError: any) {
      console.log('Falling back to mock insights generator due to API error');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Claude AI error - using generated sample insights instead. Error: " + (apiError.message || String(apiError))
      };
    }
  } catch (err: any) {
    console.error('Error generating insights:', err);
    // Always return mock insights as a fallback
    const mockInsights = generateComprehensiveInsights(project, documents);
    return { 
      insights: mockInsights,
      error: "Using generated sample insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing documents')
    };
  }
};
