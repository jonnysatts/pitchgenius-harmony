
import { supabase } from "@/integrations/supabase/client";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { GAMING_SPECIALIST_PROMPT } from "./config";

/**
 * Generate a context string from the client website
 */
export const generateWebsiteContext = (website: string): string => {
  if (!website) return '';
  return `The client's website is ${website}. Please consider this when generating insights.`;
};

/**
 * Creates a timeout promise that resolves with fallback insights after the specified timeout
 */
export const createTimeoutPromise = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  // Import the fallback insights generator
  const { generateFallbackInsights } = await import('./mockGenerators/insightGenerator');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("API call timed out, using fallback insights");
      const fallbackInsights = generateFallbackInsights(project.clientIndustry || 'technology', documents.length);
      resolve({
        insights: fallbackInsights,
        error: "API call timed out - using generated sample insights as fallback"
      });
    }, 110000); // 110 seconds timeout
  });
};

/**
 * Check if Supabase connection is working and if Anthropic API key exists
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Checking Supabase Edge Function connection...");
    
    const { data, error } = await supabase.functions.invoke('test-connection', {
      body: { test: true }
    });
    
    if (error) {
      console.error("Connection test failed:", error);
      return false;
    }
    
    return data?.anthropicKeyExists === true;
  } catch (err) {
    console.error("Error checking Supabase connection:", err);
    return false;
  }
};

/**
 * Call the Supabase Edge Function that uses Anthropic API
 */
export const callClaudeApi = async (
  project: Project,
  documents: Document[],
  documentContents: any[]
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  console.log('Making API call to Supabase Edge Function for Claude analysis...');
  
  // Prepare document IDs and website context
  const documentIds = documents.map(doc => doc.id);
  const websiteContext = project.clientWebsite ? generateWebsiteContext(project.clientWebsite) : '';
  
  try {
    // Call the proper edge function
    console.log("Calling generate-insights-with-anthropic with project:", project.id);
    const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
      body: { 
        projectId: project.id, 
        documentIds,
        clientIndustry: project.clientIndustry || 'technology',
        clientWebsite: project.clientWebsite,
        projectTitle: project.title,
        documentContents,
        processingMode: 'comprehensive',
        includeComprehensiveDetails: true,
        maximumResponseTime: 110,
        systemPrompt: GAMING_SPECIALIST_PROMPT + websiteContext
      }
    });
    
    console.log("Edge Function response received:", data ? "data present" : "no data", error ? `error: ${error.message}` : "no error");
    
    if (error) {
      console.error('Error from Edge Function:', error);
      throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
    }
    
    // Check for insufficient content flag
    if (data && data.insufficientContent === true) {
      console.log('Claude AI reported insufficient document content for meaningful insights');
      return {
        insights: [],
        insufficientContent: true,
        error: "Not enough information in documents to generate meaningful insights. Consider uploading more detailed documents or try website analysis."
      };
    }
    
    // Validate insights from API
    if (!data || !data.insights || data.insights.length === 0) {
      throw new Error('No insights returned from Claude AI');
    }
    
    // Add source marker to insights
    const markedInsights = data.insights.map((insight: StrategicInsight) => {
      return {
        ...insight,
        source: 'document' as 'document'
      };
    });
    
    console.log('Successfully received insights from Anthropic:', markedInsights.length);
    
    return { 
      insights: markedInsights,
      error: undefined,
      insufficientContent: false
    };
  } catch (apiError: any) {
    console.error('Error calling Anthropic API:', apiError);
    throw new Error(`Claude AI error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }
};
