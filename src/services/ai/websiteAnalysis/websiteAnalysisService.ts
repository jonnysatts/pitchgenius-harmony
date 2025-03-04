
/**
 * Service for analyzing website content
 */
import { supabase } from "@/integrations/supabase/client";
import { Project, WebsiteInsightCategory, WebsiteAnalysisStatus } from "@/lib/types";
import { generateFallbackWebsiteInsights } from "./fallbackInsightGenerator";

/**
 * Analyzes a client website and returns insights
 */
export const analyzeClientWebsite = async (
  project: Project,
  useFirecrawl = false
): Promise<{
  insights: any[];
  error?: string;
}> => {
  return await getWebsiteInsights(project, useFirecrawl);
};

/**
 * Returns website insights from analysis
 */
export const getWebsiteInsights = async (
  project: Project,
  useFirecrawl = false
): Promise<{
  insights: any[];
  error?: string;
}> => {
  if (!project.clientWebsite || project.clientWebsite.trim() === '') {
    console.log('No website URL provided for analysis');
    return {
      insights: generateFallbackWebsiteInsights(
        project.clientName || "", 
        project.clientIndustry || "technology",
        project.id || ""
      ),
      error: 'No website URL provided for analysis'
    };
  }

  try {
    // First, check connection 
    const connectionCheck = await checkEdgeFunctionConnection();
    
    if (!connectionCheck.success) {
      console.error('Connection check failed:', connectionCheck);
      return {
        insights: generateFallbackWebsiteInsights(
          project.clientName || "", 
          project.clientIndustry || "technology",
          project.id || ""
        ),
        error: 'Failed to connect to the analysis service'
      };
    }
    
    // Add timeout handling
    const timeoutPromise = new Promise<{
      insights: any[];
      error: string;
    }>((resolve) => {
      setTimeout(() => {
        console.log('Website analysis timed out after 120 seconds');
        resolve({
          insights: generateFallbackWebsiteInsights(
            project.clientName || "", 
            project.clientIndustry || "technology",
            project.id || ""
          ),
          error: 'Website analysis timed out after 120 seconds'
        });
      }, 120000); // 2 minutes timeout
    });
    
    // Call the Edge Function with detailed logging
    console.log(`Calling analyze-website-with-anthropic with URL: ${project.clientWebsite}`);
    
    // Log the request payload
    console.log('Request payload:', {
      website_url: project.clientWebsite,
      client_name: project.clientName || '',
      client_industry: project.clientIndustry || 'technology',
      use_firecrawl: useFirecrawl
    });
    
    // Make the actual API call
    const responsePromise = supabase.functions.invoke('analyze-website-with-anthropic', {
      body: {
        website_url: project.clientWebsite,
        client_name: project.clientName || '',
        client_industry: project.clientIndustry || 'technology',
        use_firecrawl: useFirecrawl
      }
    });
    
    // Race between API call and timeout
    const { data, error } = await Promise.race([
      responsePromise,
      // After 120 seconds, return a custom timeout error response
      new Promise<{data: null, error: {message: string}}>((resolve) => 
        setTimeout(() => resolve({
          data: null, 
          error: {message: "Edge Function timeout after 120 seconds"}
        }), 120000)
      )
    ]);
    
    // If there was an error or timeout, use fallback insights
    if (error || !data) {
      console.error('Edge function error or timeout:', error);
      return {
        insights: generateFallbackWebsiteInsights(
          project.clientName || "", 
          project.clientIndustry || "technology",
          project.id || ""
        ),
        error: `Edge function error: ${error?.message || 'Function timed out'}`
      };
    }
    
    // Validate response structure
    if (!data || !Array.isArray(data.data)) {
      console.error('Invalid response from edge function:', data);
      return {
        insights: generateFallbackWebsiteInsights(
          project.clientName || "", 
          project.clientIndustry || "technology",
          project.id || ""
        ),
        error: 'Invalid response from analysis service'
      };
    }
    
    console.log(`Successfully received ${data.data.length} insights from edge function`);
    
    // Add source marker to insights
    const markedInsights = data.data.map((insight: any) => ({
      ...insight,
      source: 'website' as 'website'
    }));
    
    return { 
      insights: markedInsights,
      error: data.error
    };
  } catch (error: any) {
    console.error('Error analyzing website:', error);
    
    // Return a more helpful error message based on the type of error
    let errorMessage = "Analysis error";
    
    if (error.message && error.message.includes('Failed to fetch')) {
      errorMessage = "Network error connecting to Edge Function. Please check your internet connection.";
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = "The analysis took too long to complete. Please try again later.";
    } else if (error.message && error.message.includes('401')) {
      errorMessage = "Authentication error with Anthropic API. Please check your API key.";
    } else {
      errorMessage = `Analysis error: ${error.message || 'Unknown error'}`;
    }
    
    return {
      insights: generateFallbackWebsiteInsights(
        project.clientName || "", 
        project.clientIndustry || "technology",
        project.id || ""
      ),
      error: errorMessage
    };
  }
};

/**
 * Check connection to the edge function
 */
export const checkEdgeFunctionConnection = async (): Promise<{ success: boolean }> => {
  try {
    console.log('Testing connection to Edge Function...');
    // Simple test call to check connectivity
    const { data, error } = await supabase.functions.invoke('test-connection', {
      method: 'POST',
      body: { test: true, timestamp: new Date().toISOString() }
    });
    
    if (error) {
      console.error('Error checking edge function connection:', error);
      return { success: false };
    }
    
    console.log('Edge Function connection test result:', data);
    return { 
      success: !error && data?.anthropicKeyExists === true 
    };
  } catch (error) {
    console.error('Exception checking edge function connection:', error);
    return { success: false };
  }
};

/**
 * Get the status of website analysis
 */
export const getWebsiteAnalysisStatus = async (
  projectId: string
): Promise<WebsiteAnalysisStatus> => {
  try {
    // Placeholder implementation - in a real app, you would fetch this from a database
    return {
      status: 'completed',
      progress: 100,
      message: 'Analysis complete',
      error: null
    };
  } catch (error) {
    console.error('Error getting website analysis status:', error);
    return {
      status: 'error',
      progress: 0,
      message: 'Error fetching analysis status',
      error: 'Analysis status could not be retrieved'
    };
  }
};

/**
 * Extract insights from raw website data
 */
export const extractInsightsFromWebsiteData = (
  websiteData: any,
  clientName: string,
  clientIndustry: string
): any[] => {
  // This would normally process raw website data into structured insights
  // For now, it's a placeholder that returns mock insights
  return generateFallbackWebsiteInsights(clientName, clientIndustry, "placeholder-id");
};
