
/**
 * Service for analyzing client websites and generating insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { checkSupabaseConnection, verifyAnthropicApiKey } from "../config";
import { createTimeoutPromise } from "../apiClient";
import { generateMockWebsiteInsights } from "./mockGenerator";
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
    
    // First check if Anthropic API key exists
    const hasAnthropicKey = await verifyAnthropicApiKey();
    if (!hasAnthropicKey) {
      console.error('ANTHROPIC_API_KEY missing in Supabase secrets');
      toast({
        title: "Missing API Key",
        description: "ANTHROPIC_API_KEY not found. Using sample insights instead.",
        variant: "destructive",
        duration: 5000,
      });
      
      const mockInsights = generateMockWebsiteInsights(project);
      return { 
        insights: mockInsights,
        error: "ANTHROPIC_API_KEY not found in Supabase secrets. Please add it to use Claude AI features."
      };
    }
    
    // Directly try to test Supabase connection 
    let connectionOk = await checkSupabaseConnection();
    console.log('Supabase connection check result:', connectionOk);
    
    // Notify user of analysis start
    toast({
      title: "Website Analysis Started",
      description: `Analyzing ${project.clientWebsite}...`,
      duration: 5000,
    });
    
    if (!connectionOk) {
      console.log('Supabase connection not available, using mock website insights');
      
      toast({
        title: "Using Sample Analysis",
        description: "Could not connect to Supabase. Using sample insights instead.",
        variant: "destructive",
        duration: 5000,
      });
      
      const websiteMockInsights = generateMockWebsiteInsights(project);
      return { 
        insights: websiteMockInsights,
        error: "Using sample website insights - no Supabase connection available"
      };
    }
    
    // Create a timeout promise - 3 minutes for analysis
    const timeoutPromise = createTimeoutPromise(project, [], 180000);
    
    try {
      console.log('Calling website analysis via Supabase Edge Function...');
      
      // Prepare the request payload with all the necessary information
      const payload = { 
        projectId: project.id,
        clientWebsite: project.clientWebsite,
        clientName: project.clientName || 'Client',
        clientIndustry: project.clientIndustry || 'General',
        timestamp: new Date().toISOString(), // Add timestamp to avoid caching
        debugInfo: true  // Flag to enable extra debugging in the edge function
      };
      
      // Call the enhanced website analysis edge function
      const apiPromise = (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
            body: payload
          });
          
          if (error) {
            console.error('Error from Edge Function:', error);
            console.error('Error details:', JSON.stringify(error));
            
            toast({
              title: "Analysis Error",
              description: error.message || "Error connecting to edge function",
              variant: "destructive",
              duration: 7000,
            });
            
            throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
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
          
          // Process the insights to make sure they're properly formatted
          const processedInsights = data.insights.map(insight => ({
            ...insight,
            source: 'website' as 'website' // Explicitly cast to 'website' literal type
          }));
          
          // Success - log the insights
          console.log(`Received ${processedInsights.length} insights from Edge Function`);
          if (processedInsights.length > 0) {
            console.log('First insight sample:', JSON.stringify(processedInsights[0]));
          }
          
          toast({
            title: "Analysis Complete",
            description: `Generated ${processedInsights.length} insights from website analysis`,
            duration: 5000,
          });
          
          return { insights: processedInsights };
        } catch (innerError) {
          console.error('Error in website analysis:', innerError);
          throw innerError;
        }
      })();
      
      // Race between the API call and timeout
      return await Promise.race([apiPromise, timeoutPromise]);
    } catch (apiError) {
      console.error('Error during website analysis:', apiError);
      
      toast({
        title: "Analysis Failed",
        description: "Using generated samples instead.",
        variant: "destructive",
        duration: 5000,
      });
      
      const mockInsights = generateMockWebsiteInsights(project);
      return { 
        insights: mockInsights,
        error: "API errors during website analysis - using generated sample insights instead. Error: " + (apiError instanceof Error ? apiError.message : String(apiError))
      };
    }
  } catch (err) {
    console.error('Error analyzing website:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while analyzing the website';
    
    toast({
      title: "Analysis Error",
      description: errorMessage,
      variant: "destructive", 
      duration: 7000,
    });
    
    const mockInsights = generateMockWebsiteInsights(project);
    return { 
      insights: mockInsights,
      error: "Using generated sample website insights due to an error: " + errorMessage
    };
  }
};

/**
 * Get the current status of a website analysis
 */
export const getWebsiteAnalysisStatus = async (projectId: string): Promise<{
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}> => {
  // Implementation for checking analysis status
  return {
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze website'
  };
};

/**
 * Extract structured insights from raw website data
 */
export const extractInsightsFromWebsiteData = (websiteData: any, project: Project): StrategicInsight[] => {
  // Implementation for extracting insights from website data
  return [];
};
