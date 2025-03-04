
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
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  // Import the fallback insights generator
  const { generateFallbackInsights } = await import('./mockGenerators/insightGenerator');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("API call timed out, using fallback insights");
      const fallbackInsights = generateFallbackInsights(project.clientIndustry || 'technology', documents.length);
      resolve({
        insights: fallbackInsights,
        error: "API call timed out - using generated sample insights as fallback",
        insufficientContent: false // Explicitly set to false for fallback data
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
      method: 'POST',
      body: { test: true, timestamp: new Date().toISOString() }
    });
    
    if (error) {
      console.error("Connection test failed:", error);
      console.error("Error details:", JSON.stringify(error));
      return false;
    }
    
    console.log('Supabase connection test result:', data);
    
    // Check specifically for ANTHROPIC_API_KEY
    const anthropicKeyExists = data?.anthropicKeyExists === true;
    
    return anthropicKeyExists;
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
    // Create a timeout promise to handle edge function timeouts
    const timeoutPromise = createTimeoutPromise(project, documents);
    
    // Call the proper edge function
    console.log("Calling generate-insights-with-anthropic with project:", project.id);
    
    // Add some diagnostic info to help debug
    console.log("Edge function request payload:", {
      projectId: project.id,
      documentCount: documentContents.length,
      clientIndustry: project.clientIndustry || 'technology',
      clientWebsite: project.clientWebsite,
      projectTitle: project.title
    });
    
    // Make the actual request to the edge function with error handling
    const responsePromise = supabase.functions.invoke('generate-insights-with-anthropic', {
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
    
    // Race between the API call and the timeout
    const { data, error } = await Promise.race([
      responsePromise,
      // Wait 110 seconds then resolve with null to indicate timeout
      new Promise<{data: null, error: {message: string}}>((resolve) => 
        setTimeout(() => resolve({
          data: null,
          error: {message: "Edge Function timed out after 110 seconds"}
        }), 110000)
      )
    ]);
    
    console.log("Edge Function response received:", 
      data ? "data present" : "no data", 
      error ? `error: ${error.message}` : "no error"
    );
    
    // If there was an error or timeout, use the fallback data
    if (error || !data) {
      console.error('Error from Edge Function:', error);
      return await timeoutPromise;
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
      console.error('No insights returned from Claude AI, using fallback');
      return await timeoutPromise;
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
    
    // Return a more helpful error message based on the type of error
    let errorMessage = "Claude AI error";
    
    if (apiError.message && apiError.message.includes('Failed to fetch')) {
      errorMessage = "Network error connecting to Edge Function. Please check your internet connection.";
    } else if (apiError.message && apiError.message.includes('timeout')) {
      errorMessage = "The analysis took too long to complete. Try with fewer documents or check the Edge Function logs.";
    } else if (apiError.message && apiError.message.includes('401')) {
      errorMessage = "Authentication error with Anthropic API. Please check your API key.";
    } else if (apiError.message && apiError.message.includes('429')) {
      errorMessage = "Anthropic API rate limit exceeded. Please try again later.";
    } else if (apiError.message && apiError.message.includes('500')) {
      errorMessage = "Anthropic API server error. Please try again later.";
    } else {
      errorMessage = `Claude AI error: ${apiError instanceof Error ? apiError.message : String(apiError)}`;
    }
    
    // Fall back to timeout promise for error case
    const fallbackResponse = await createTimeoutPromise(project, documents);
    return { 
      ...fallbackResponse,
      error: errorMessage
    };
  }
};
