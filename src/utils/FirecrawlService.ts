
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
      
      try {
        // First try to construct a URL object to validate
        // If it fails with a relative URL, we'll add the protocol in the next step
        new URL(normalizedUrl);
      } catch (e) {
        // URL constructor failed, it's likely missing a protocol
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Ensure protocol is present
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Remove trailing slashes for consistency
      normalizedUrl = normalizedUrl.replace(/\/+$/, '');
      
      console.log(`Normalized URL: ${normalizedUrl}`);
      
      // First, check the analysis progress (also confirms the Edge Function is responsive)
      try {
        const progressCheck = await this.checkAnalysisProgress(normalizedUrl);
        if (!progressCheck.success) {
          console.warn("Progress check failed, but continuing with analysis attempt");
        }
      } catch (error) {
        console.warn("Progress check failed with error:", error);
        // Continue anyway as this is just a preliminary check
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
        
        // If we get edge function error but the error body contains insights
        // This can happen when the function returns a non-200 status but still has data
        if (error.message && error.message.includes('non-2xx status code')) {
          try {
            // Try to parse the error message as JSON to extract data
            const errorData = typeof error.message === 'string' ? 
              JSON.parse(error.message) : error;
              
            if (errorData && errorData.insights && Array.isArray(errorData.insights)) {
              console.log("Extracted insights from error message");
              
              // Check if these are actually fallback insights
              const allFallbacks = errorData.insights.every((insight: any) => 
                insight.id && insight.id.includes('fallback_')
              );
              
              if (allFallbacks || errorData.usingFallback === true) {
                console.log("Insights from error response are fallbacks, returning error instead");
                return {
                  success: false,
                  error: errorData.error || "Failed to extract meaningful content from website",
                  insights: [] // Return empty array to prevent fallbacks from showing as real insights
                };
              }
              
              // Return the insights if they don't appear to be fallbacks
              return {
                success: true,
                insights: errorData.insights
              };
            }
          } catch (parseError) {
            console.error("Error parsing error message as JSON:", parseError);
          }
        }
        
        // Return the original error if we couldn't extract data
        return {
          success: false,
          error: error.message || `API error: ${error.code || 'unknown'}`,
          // Don't set retriableError for edge function errors - these need to be fixed
          retriableError: false,
          insights: [] // Ensure an empty array is returned
        };
      }
      
      // Check if the API returned a direct error message
      if (data?.error) {
        console.error('Error from API response:', data.error);
        
        // Check for specific HTTP status errors
        const isHttpError = typeof data.error === 'string' && (
          data.error.includes('HTTP error') || 
          data.error.includes('403') || 
          data.error.includes('401')
        );
                            
        // Check if error is related to Claude being overloaded
        const isRetriable = typeof data.error === 'string' && (
          data.error.includes('overloaded') || 
          data.error.includes('rate limit') || 
          data.error.includes('429') || 
          data.error.includes('529')
        );
        
        // Check if this response includes fallback insights
        const hasFallbacks = data.insights && 
                           Array.isArray(data.insights) && 
                           data.insights.some((insight: any) => insight.id && insight.id.includes('fallback_'));
        
        // If these are fallback insights, don't return them as real ones
        const insightsToReturn = hasFallbacks || data.usingFallback ? [] : (data.insights || []);
            
        return {
          success: false,
          error: data.error,
          insights: insightsToReturn, // Empty if fallbacks, or whatever was returned
          retriableError: isRetriable
        };
      }
      
      // Check if the API returned proper insights
      if (data?.insights && Array.isArray(data.insights) && data.insights.length > 0) {
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
          "Placeholder Title",
          "Essential Business Focus Areas",  // Match fallback titles
          "Target Audience Analysis",
          "Competitive Differentiation", 
          "Growth Expansion Possibilities",
          "Strategic Priorities",
          "Core Brand Narratives"
        ];
        
        // Check for fallback insights by ID pattern
        const hasFallbackInsights = data.insights.some((insight: any) => 
          insight.id && insight.id.includes('fallback_')
        );
        
        // Check if all insights have error-related titles or are marked as fallbacks
        const allErrorInsights = data.insights.every((insight: any) => {
          const title = insight.content?.title || '';
          const id = insight.id || '';
          
          // Check if it's a fallback insight
          const isFallbackInsight = id.includes('fallback_');
          
          // Check if title matches any error patterns
          const hasTitleMatch = errorTitles.some(errorTitle => title.includes(errorTitle));
          
          return hasTitleMatch || isFallbackInsight;
        });
        
        // Also check if insights have error-related content
        const errorContentPatterns = [
          "Failed to extract content",
          "could not be accessed",
          "HTTP error",
          "accessibility issues",
          "Website content could not be accessed",
          "No specific evidence",
          "Evidence would normally be extracted",
          "Without access to the website"
        ];
        
        const hasErrorContent = data.insights.some((insight: any) => {
          const details = insight.content?.details || '';
          return errorContentPatterns.some(pattern => details.includes(pattern));
        });
        
        if (allErrorInsights || hasErrorContent || data.usingFallback === true || hasFallbackInsights) {
          // Even though we got insights, they're all error-related or fallbacks
          const errorMessage = data.error || 
                            data.insights[0]?.content?.details || 
                            "Failed to extract meaningful content from website. Try a different website.";
          
          return {
            success: false,
            error: errorMessage,
            insights: [] // Return empty array to prevent fallback insights from appearing as real ones
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
        error: data?.error || "Failed to extract meaningful content from website. Try a different website.",
        insights: []
      };
    } catch (error) {
      console.error("Error analyzing website:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error analyzing website",
        retriableError: false,
        insights: [] // Ensure empty insights array to prevent fallbacks
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
