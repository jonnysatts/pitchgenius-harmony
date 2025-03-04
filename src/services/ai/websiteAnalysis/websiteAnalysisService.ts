
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
    
    // Call the Edge Function
    console.log(`Calling analyze-website-with-anthropic with URL: ${project.clientWebsite}`);
    const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
      body: {
        website_url: project.clientWebsite,
        client_name: project.clientName || '',
        client_industry: project.clientIndustry || 'technology',
        use_firecrawl: useFirecrawl
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      return {
        insights: generateFallbackWebsiteInsights(
          project.clientName || "", 
          project.clientIndustry || "technology",
          project.id || ""
        ),
        error: `Edge function error: ${error.message || 'Unknown error'}`
      };
    }
    
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
    return {
      insights: generateFallbackWebsiteInsights(
        project.clientName || "", 
        project.clientIndustry || "technology",
        project.id || ""
      ),
      error: `Analysis error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Check connection to the edge function
 */
export const checkEdgeFunctionConnection = async (): Promise<{ success: boolean }> => {
  try {
    // Simple test call to check connectivity
    const { error } = await supabase.functions.invoke('test-connection');
    return { success: !error };
  } catch (error) {
    console.error('Error checking edge function connection:', error);
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
