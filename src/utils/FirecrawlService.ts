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
  ): Promise<{success: boolean, error?: string, insights?: any[]}> {
    try {
      console.log(`Analyzing website: ${websiteUrl}`);
      
      // First, check the analysis progress (also confirms the Edge Function is responsive)
      const progressCheck = await this.checkAnalysisProgress(websiteUrl);
      if (!progressCheck.success) {
        console.warn("Progress check failed, but continuing with analysis attempt");
      }
      
      // Call the Supabase Edge Function for website analysis
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: {
          website_url: websiteUrl,
          client_name: clientName,
          client_industry: clientIndustry,
          timeout_seconds: 60,
          max_pages: 10
        }
      });
      
      if (error) {
        console.error('Error from Edge Function:', error);
        return {
          success: false,
          error: error.message || `API error: ${error.code || 'unknown'}`
        };
      }
      
      // Check if the API returned proper insights
      if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        return {
          success: true,
          insights: data.insights
        };
      }
      
      // If we got a valid response but no insights, it might be demo data
      if (data.error) {
        return {
          success: true,
          error: data.error,
          insights: data.sample_insights || []
        };
      }
      
      return {
        success: true,
        error: "Received a valid response but no insights were found.",
        insights: []
      };
    } catch (error) {
      console.error("Error analyzing website:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error analyzing website"
      };
    }
  }
  
  // Check progress of analysis - now public instead of private
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
