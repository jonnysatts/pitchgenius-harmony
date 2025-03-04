
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

// Re-export other AI service functions
export { checkSupabaseConnection } from "./apiClient";
