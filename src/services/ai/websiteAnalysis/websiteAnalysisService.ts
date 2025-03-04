
/**
 * Service for analyzing client websites and generating insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { checkSupabaseConnection } from "../config";
import { createTimeoutPromise } from "../apiClient";
import { callWebsiteAnalysisApi } from "./claudeApiService";
import { generateWebsiteMockInsights } from "./mockGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    console.log(`Project ID: ${project.id}, Client Name: ${project.clientName || 'Unknown'}`);
    
    // Check if we can use the real API
    const useRealApi = await checkSupabaseConnection();
    console.log('Supabase connection check result:', useRealApi);
    
    // Notify user of analysis start
    toast({
      title: "Website Analysis Started",
      description: `Analyzing ${project.clientWebsite}...`,
      duration: 5000,
    });
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock website insights');
      const websiteMockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: websiteMockInsights,
        error: "Using sample website insights - no Supabase connection available"
      };
    }
    
    // Create a timeout promise - 3 minutes for analysis
    const timeoutPromise = createTimeoutPromise(project, [], 180000);
    
    try {
      console.log('Using enhanced website analysis via Supabase Edge Function');
      console.log('Preparing request payload for edge function...');
      
      // Prepare the request payload with complete debugging information
      const payload = { 
        projectId: project.id,
        clientWebsite: project.clientWebsite,
        clientName: project.clientName || 'Client',
        clientIndustry: project.clientIndustry || 'General',
        timestamp: new Date().toISOString(), // Add timestamp to avoid caching
        debugInfo: true  // Flag to enable extra debugging in the edge function
      };
      
      console.log('Edge function payload:', JSON.stringify(payload));
      
      // Call the enhanced website analysis
      const result = await Promise.race([
        (async () => {
          try {
            console.log('Invoking analyze-website-with-anthropic edge function...');
            
            // Direct call to edge function with better error handling
            const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
              body: payload
            });
            
            if (error) {
              console.error('Error from Edge Function:', error);
              console.error('Error details:', JSON.stringify(error));
              throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
            }
            
            console.log('Edge function response received');
            
            // Validate the response structure
            if (!data) {
              console.error('Edge function returned empty data');
              throw new Error('Empty response from Edge Function');
            }
            
            if (data.error) {
              console.error('Edge function returned error in data:', data.error);
              throw new Error(`Analysis error: ${data.error}`);
            }
            
            if (!data.insights || !Array.isArray(data.insights)) {
              console.error('Invalid insights format in response:', data);
              throw new Error('No insights array in Edge Function response');
            }
            
            // Success - log the insights
            console.log(`Received ${data.insights.length} insights from Edge Function`);
            console.log('First insight sample:', JSON.stringify(data.insights[0]));
            
            return { insights: data.insights };
          } catch (error) {
            console.error('Error in website analysis:', error);
            console.error('Stack trace if available:', error.stack);
            throw error;
          }
        })(),
        timeoutPromise
      ]);
      
      return result;
    } catch (apiError) {
      console.log('Error during website analysis, trying fallback approach');
      console.error('API error details:', apiError);
      
      try {
        // Try with direct Claude API as fallback
        toast({
          title: "Trying Alternative Method",
          description: "Website analysis failed, trying another approach...",
          duration: 5000,
        });
        
        return await Promise.race([
          callWebsiteAnalysisApi(project),
          timeoutPromise
        ]);
      } catch (claudeError) {
        console.log('All API approaches failed, using mock insights');
        console.error('Claude API error details:', claudeError);
        
        toast({
          title: "Analysis Failed",
          description: "Using generated samples instead.",
          variant: "destructive",
          duration: 5000,
        });
        
        const mockInsights = generateWebsiteMockInsights(project);
        return { 
          insights: mockInsights,
          error: "API errors during website analysis - using generated sample insights instead. Error: " + (claudeError.message || String(claudeError))
        };
      }
    }
  } catch (err) {
    console.error('Error analyzing website:', err);
    const errorMessage = err.message || 'An unexpected error occurred while analyzing the website';
    
    toast({
      title: "Analysis Error",
      description: errorMessage,
      variant: "destructive", 
      duration: 7000,
    });
    
    const mockInsights = generateWebsiteMockInsights(project);
    return { 
      insights: mockInsights,
      error: "Using generated sample website insights due to an error: " + errorMessage
    };
  }
};
