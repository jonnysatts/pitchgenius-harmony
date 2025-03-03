
/**
 * Generation of strategic insights using AI
 */
import { Document, StrategicInsight, Project } from "@/lib/types";
import { checkSupabaseConnection } from "./config";
import { generateComprehensiveInsights } from "./mockGenerators/insightFactory";
import { callClaudeApi, createTimeoutPromise } from "./apiClient";
import { prepareDocumentContents } from "./promptUtils";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  try {
    console.log(`Processing ${documents.length} documents for project ${project.id}`);
    
    // Check for empty or minimal document content
    if (documents.length === 0) {
      return {
        insights: [],
        insufficientContent: true,
        error: "No documents provided for analysis. Please upload documents or try website analysis."
      };
    }
    
    // Prepare document contents
    const documentContents = prepareDocumentContents(documents, project);
    
    // Check for very small document contents (likely insufficient for analysis)
    const totalContentSize = documentContents.reduce((total, doc) => total + (doc.content?.length || 0), 0);
    if (totalContentSize < 200) { // Arbitrary small threshold
      console.log('Document content appears too limited for meaningful analysis');
      return {
        insights: [],
        insufficientContent: true,
        error: "The uploaded documents contain very little content for analysis. Consider uploading more detailed documents or try website analysis."
      };
    }

    // Check if we're in development mode without Supabase or if Supabase connection failed
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock insights generator');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Using sample insights - no Supabase connection available",
        insufficientContent: false
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to generate insights');
    
    // Create a timeout promise - 120 seconds (2 minutes)
    const timeoutPromise = createTimeoutPromise(project, documents, 120000);
    
    try {
      // Race between the actual API call and the timeout
      const result = await Promise.race([
        callClaudeApi(project, documents, documentContents),
        timeoutPromise
      ]);
      
      // Pass through the insufficientContent flag if it exists
      return {
        insights: result.insights,
        error: result.error,
        insufficientContent: result.insufficientContent || false
      };
    } catch (apiError: any) {
      console.log('Falling back to mock insights generator due to API error');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Claude AI error - using generated sample insights instead. Error: " + (apiError.message || String(apiError)),
        insufficientContent: false
      };
    }
  } catch (err: any) {
    console.error('Error generating insights:', err);
    // Always return mock insights as a fallback
    const mockInsights = generateComprehensiveInsights(project, documents);
    return { 
      insights: mockInsights,
      error: "Using generated sample insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing documents'),
      insufficientContent: false
    };
  }
};
