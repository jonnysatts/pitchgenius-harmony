
import { supabase } from "@/integrations/supabase/client";

// This service connects to the Supabase Edge Function to analyze websites
export class FirecrawlService {
  // Test if the website analysis function is accessible
  static async testWebsiteAnalysis(): Promise<{success: boolean, error?: string}> {
    try {
      // Test connection to the Edge Function
      console.log("Testing website analysis function");
      
      try {
        // Directly call the Supabase Edge Function with test_mode: true
        const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
          body: { test_mode: true }
        });
        
        if (error) {
          console.error('Error testing website analysis:', error);
          return { 
            success: false, 
            error: error.message || "API test failed. Please check configuration." 
          };
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error in test connection:', error);
        if (error.name === 'AbortError') {
          return { 
            success: false, 
            error: "Test connection timed out. Please check API configuration." 
          };
        }
        throw error;
      }
    } catch (error) {
      console.error("Error testing website analysis:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error during test" 
      };
    }
  }
  
  // Analyze a website via the Supabase Edge Function
  static async analyzeWebsiteViaSupabase(
    websiteUrl: string,
    clientName: string = "",
    clientIndustry: string = "technology"
  ): Promise<{success: boolean, error?: string, insights?: any[], retriableError?: boolean}> {
    try {
      console.log(`Analyzing website: ${websiteUrl}`);
      
      // Normalize the URL format - ensure proper protocol
      let normalizedUrl = websiteUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Remove trailing slashes for consistency
      normalizedUrl = normalizedUrl.replace(/\/+$/, '');
      
      console.log(`Normalized URL: ${normalizedUrl}`);
      
      // First, check the analysis progress (also confirms the Edge Function is responsive)
      const progressCheck = await this.checkAnalysisProgress(normalizedUrl);
      if (!progressCheck.success) {
        console.warn("Progress check failed, but continuing with analysis attempt");
      }
      
      // Call the Supabase Edge Function for website analysis with increased timeout
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: {
          website_url: normalizedUrl,
          client_name: clientName,
          client_industry: clientIndustry,
          timeout_seconds: 90, // Increased timeout
          max_pages: 10,
          bypass_cors: true // Signal to the edge function to use server-side fetch
        }
      });
      
      if (error) {
        console.error('Error from Edge Function:', error);
        return {
          success: false,
          error: error.message || `API error: ${error.code || 'unknown'}`,
          // Don't set retriableError for edge function errors - these need to be fixed
          retriableError: false
        };
      }
      
      // Check if the API returned a direct error message
      if (data.error) {
        console.error('Error from API response:', data.error);
        
        // Check for specific HTTP status errors
        const isHttpError = data.error.includes('HTTP error') || 
                            data.error.includes('403') || 
                            data.error.includes('401');
                            
        // Check if error is related to Claude being overloaded
        const isRetriable = 
          (typeof data.error === 'string' && 
           (data.error.includes('overloaded') || 
            data.error.includes('rate limit') || 
            data.error.includes('429') || 
            data.error.includes('529')));
            
        return {
          success: false,
          error: data.error,
          insights: data.insights || [],
          retriableError: isRetriable
        };
      }
      
      // Check if the API returned proper insights
      if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        // Always check if insights are usable - sometimes we get error insights
        const errorTitles = [
          "Improve Website Accessibility",
          "Website Accessibility Issue", 
          "Website Unavailable",
          "Prioritize Website Accessibility",
          "Unable to Assess",
          "Unable to Identify",
          "Unable to Evaluate",
          "Unable to Provide",
          "Placeholder Title"
        ];
        
        const allErrorInsights = data.insights.every(insight => 
          errorTitles.some(errorTitle => 
            insight.content?.title?.includes(errorTitle)
          )
        );
        
        if (allErrorInsights) {
          // Even though we got insights, they're all error-related
          return {
            success: false,
            error: data.insights[0]?.content?.details || "Unable to extract content from website",
            insights: data.insights
          };
        }
        
        return {
          success: true,
          insights: data.insights
        };
      }
      
      // Fallback to basic error handling
      return {
        success: false,
        error: "Received a valid response but no insights were found.",
        insights: []
      };
    } catch (error) {
      console.error("Error analyzing website:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error analyzing website",
        retriableError: false
      };
    }
  }
  
  // Check progress of analysis
  static async checkAnalysisProgress(
    websiteUrl: string
  ): Promise<{success: boolean, progress?: number, error?: string}> {
    try {
      console.log(`Checking analysis progress for: ${websiteUrl}`);
      
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: { 
          website_url: websiteUrl,
          check_progress: true 
        }
      });
      
      if (error) {
        console.error('Error checking analysis progress:', error);
        return {
          success: false,
          error: error.message || `API error: ${error.code || 'unknown'}`
        };
      }
      
      return {
        success: true,
        progress: data?.progress || 0
      };
    } catch (error) {
      console.warn("Error checking analysis progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error checking progress"
      };
    }
  }
}
