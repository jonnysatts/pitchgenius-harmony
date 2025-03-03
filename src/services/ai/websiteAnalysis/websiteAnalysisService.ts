
/**
 * Service for analyzing client websites and generating insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { checkSupabaseConnection } from "../config";
import { createTimeoutPromise } from "../apiClient";
import { callWebsiteAnalysisApi } from "./claudeApiService";
import { generateWebsiteMockInsights } from "./mockGenerator";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { supabase } from "@/integrations/supabase/client";

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
    
    // By default, assume we're using Firecrawl via Supabase
    const useFirecrawl = true;
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock website insights');
      const websiteMockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: websiteMockInsights,
        error: "Using sample website insights - no Supabase connection available"
      };
    }
    
    if (useFirecrawl) {
      console.log('Using Firecrawl enhanced website analysis via Supabase Edge Function');
      
      // Create a timeout promise - 180 seconds (3 minutes) for Firecrawl analysis
      const timeoutPromise = createTimeoutPromise(project, [], 180000);
      
      try {
        // Race between the Firecrawl analysis and the timeout
        return await Promise.race([
          (async () => {
            try {
              // Call the Firecrawl-enhanced website analysis via Supabase Edge Function
              const result = await FirecrawlService.analyzeWebsiteViaSupabase(
                project.clientWebsite!,
                project.id,
                project.clientName || 'Client',
                project.clientIndustry || 'General'
              );
              
              if (result.insights && Array.isArray(result.insights)) {
                return { insights: result.insights };
              } else {
                console.error('Invalid response from Firecrawl analysis:', result);
                throw new Error('Invalid response from website analysis');
              }
            } catch (error) {
              console.error('Error in Firecrawl analysis:', error);
              throw error;
            }
          })(),
          timeoutPromise
        ]);
      } catch (apiError: any) {
        console.log('Falling back to Claude direct API due to Firecrawl error');
        console.error('Firecrawl error details:', apiError);
        
        try {
          // Try with direct Claude API as fallback
          return await Promise.race([
            callWebsiteAnalysisApi(project),
            timeoutPromise
          ]);
        } catch (claudeError: any) {
          console.log('Falling back to mock website insights due to all API errors');
          console.error('Claude API error details:', claudeError);
          const mockInsights = generateWebsiteMockInsights(project);
          return { 
            insights: mockInsights,
            error: "API errors during website analysis - using generated sample insights instead. Error: " + (claudeError.message || String(claudeError))
          };
        }
      }
    } else {
      console.log('Using Anthropic API via Supabase Edge Function to analyze website');
      
      // Create a timeout promise - 60 seconds (1 minute) for regular analysis
      const timeoutPromise = createTimeoutPromise(project, [], 60000);
      
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
