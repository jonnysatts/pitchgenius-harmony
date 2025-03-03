
/**
 * Module for handling AI API interactions
 */
import { supabase } from "@/integrations/supabase/client";
import { Document, Project, StrategicInsight } from "@/lib/types";
import { prepareDocumentContents } from "./promptUtils";
import { GAMING_SPECIALIST_PROMPT, generateWebsiteContext } from "./promptEngineering";
import { generateComprehensiveInsights } from "./mockGenerators/insightFactory";

/**
 * Call the Supabase Edge Function that uses Anthropic API
 */
export const callClaudeApi = async (
  project: Project,
  documents: Document[],
  documentContents: any[]
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  console.log('Making API call to Supabase Edge Function for Claude analysis...');
  
  const documentIds = documents.map(doc => doc.id);
  const websiteContext = generateWebsiteContext(project.clientWebsite);
  
  try {
    // Call the Supabase Edge Function that uses Anthropic
    const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
      body: { 
        projectId: project.id, 
        documentIds,
        clientIndustry: project.clientIndustry,
        clientWebsite: project.clientWebsite,
        projectTitle: project.title,
        documentContents,
        processingMode: 'comprehensive', // Changed from 'quick' to 'comprehensive' for more detailed analysis
        includeComprehensiveDetails: true,
        maximumResponseTime: 110, // Tell Claude to try to respond within 110 seconds (just under our 2-minute timeout)
        systemPrompt: GAMING_SPECIALIST_PROMPT + websiteContext // Add the gaming specialist prompt with website context
      }
    });
    
    if (error) {
      console.error('Error from Edge Function:', error);
      const errorMessage = error.message || 'Unknown error';
      const statusCode = error.code || 'No status code';
      console.error(`Edge Function error: ${errorMessage} (Status: ${statusCode})`);
      
      throw new Error(`Edge Function returned a non-2xx status code: ${statusCode} - ${errorMessage}`);
    }
    
    // Check if the response indicates insufficient content
    if (data && data.insufficientContent === true) {
      console.log('Claude AI reported insufficient document content for meaningful insights');
      return {
        insights: [],
        insufficientContent: true,
        error: "Not enough information in documents to generate meaningful insights. Consider uploading more detailed documents or try website analysis."
      };
    }
    
    // Check if we received valid insights from the API
    if (!data || !data.insights || data.insights.length === 0) {
      throw new Error('No insights returned from Claude AI');
    }
    
    // Add explicit source marker to all insights
    const markedInsights = data.insights.map((insight: StrategicInsight) => {
      return {
        ...insight,
        source: 'document' as 'document'  // Explicitly cast to the literal type
      };
    });
    
    console.log('Successfully received insights from Anthropic:', markedInsights.length);
    console.log('Insight categories:', markedInsights.map((i: StrategicInsight) => i.category));
    
    return { 
      insights: markedInsights || [],
      error: undefined,
      insufficientContent: false
    };
  } catch (apiError: any) {
    console.error('Error calling Anthropic API:', apiError);
    const errorDetails = apiError instanceof Error ? apiError.message : JSON.stringify(apiError);
    console.error(`API call error details: ${errorDetails}`);
    
    throw new Error(`Claude AI error: ${errorDetails}`);
  }
};

/**
 * Create a timeout promise that resolves with fallback insights after the specified time
 */
export const createTimeoutPromise = (
  project: Project, 
  documents: Document[],
  timeoutMs: number = 120000 // 2 minutes default
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  return new Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }>((resolve) => {
    setTimeout(() => {
      console.log('API request taking too long, falling back to mock insights');
      const mockInsights = generateComprehensiveInsights(project, documents);
      
      // Ensure all mock insights are marked as document-derived with proper typing
      const markedInsights = mockInsights.map(insight => ({
        ...insight,
        source: 'document' as 'document'  // Explicitly cast to the literal type
      }));
      
      resolve({ 
        insights: markedInsights, 
        error: "Claude AI timeout - using generated sample insights instead. If you want to try again with Claude AI, please use the Retry Analysis button.",
        insufficientContent: false
      });
    }, timeoutMs); // timeout in milliseconds
  });
};
