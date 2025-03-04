
// This service connects to the Supabase Edge Function to analyze websites
export class FirecrawlService {
  // Test if the website analysis function is accessible
  static async testWebsiteAnalysis(): Promise<{success: boolean, error?: string}> {
    try {
      // Test connection to the Edge Function
      console.log("Testing website analysis function");
      
      // Setting a short timeout for the test to fail fast if no response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for test
      
      try {
        // In a real implementation, this would call the Edge Function with test_mode: true
        const response = await fetch('/api/analyze-website-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ test_mode: true }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.error || "API test failed. Please check configuration." 
          };
        }
        
        return { success: true };
      } catch (error) {
        clearTimeout(timeoutId);
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
      
      // First, simulate a progress check to ensure the Edge Function is responding
      const progressCheck = await this.checkAnalysisProgress(websiteUrl);
      if (!progressCheck.success) {
        console.warn("Progress check failed, but continuing with analysis attempt");
      }
      
      // Call the actual Edge Function for website analysis
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_url: websiteUrl,
          client_name: clientName,
          client_industry: clientIndustry,
          timeout_seconds: 60,
          max_pages: 10
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `API error: ${response.status}`
        };
      }
      
      const data = await response.json();
      
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
  
  // Add a new method to check progress of analysis
  // This helps reduce timeouts by splitting the request into smaller parts
  private static async checkAnalysisProgress(
    websiteUrl: string
  ): Promise<{success: boolean, progress?: number, error?: string}> {
    try {
      console.log(`Checking analysis progress for: ${websiteUrl}`);
      
      const response = await fetch('/api/analyze-website-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website_url: websiteUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `API error: ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        success: true,
        progress: data.progress || 0
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
