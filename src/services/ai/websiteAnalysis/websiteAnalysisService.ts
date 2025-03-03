
/**
 * Service for analyzing client websites and generating insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { checkSupabaseConnection } from "../config";
import { createTimeoutPromise } from "../apiClient";
import { callWebsiteAnalysisApi } from "./claudeApiService";
import { generateWebsiteMockInsights } from "./mockGenerator";

/**
 * Analyze a client website to generate preliminary insights
 */
export const analyzeClientWebsite = async (
  project: Project
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Skip if no website URL is provided
    if (!project.clientWebsite) {
      return { 
        insights: [],
        error: "No client website URL provided for analysis" 
      };
    }

    console.log(`Analyzing client website: ${project.clientWebsite}`);
    
    // Check if we can use the real API
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock website insights');
      const websiteMockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: websiteMockInsights,
        error: "Using sample website insights - no Supabase connection available"
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to analyze website');
    
    // Create a timeout promise - 120 seconds (2 minutes)
    const timeoutPromise = createTimeoutPromise(project, [], 120000);
    
    try {
      // Race between the actual API call and the timeout
      return await Promise.race([
        callWebsiteAnalysisApi(project),
        timeoutPromise
      ]);
    } catch (apiError: any) {
      console.log('Falling back to mock website insights due to API error');
      console.error('API error details:', apiError);
      const mockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: mockInsights,
        error: "Claude AI error during website analysis - using generated sample insights instead. Error: " + (apiError.message || String(apiError))
      };
    }
  } catch (err: any) {
    console.error('Error analyzing website:', err);
    const mockInsights = generateWebsiteMockInsights(project);
    return { 
      insights: mockInsights,
      error: "Using generated sample website insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing the website')
    };
  }
};
