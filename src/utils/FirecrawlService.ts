
/**
 * Service for interacting with Firecrawl API
 */

// We'll create our implementation that's both browser and Supabase-safe
export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  
  /**
   * Save the Firecrawl API key to localStorage
   */
  static saveApiKey(apiKey: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    }
  }
  
  /**
   * Get the Firecrawl API key from localStorage
   */
  static getApiKey(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.API_KEY_STORAGE_KEY);
    }
    return null;
  }
  
  /**
   * Clear the Firecrawl API key from localStorage
   */
  static clearApiKey(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    }
  }
  
  /**
   * Check if a Firecrawl API key is set
   */
  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }
  
  /**
   * Test the provided API key with a simple operation
   * Returns true if the API key is valid
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.firecrawl.dev/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ test: true })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  /**
   * Analyze a website using Firecrawl via Supabase Edge Function
   * This is the preferred method as it uses the API key from Supabase secrets
   */
  static async analyzeWebsiteViaSupabase(
    url: string, 
    clientName: string = "", 
    clientIndustry: string = "technology"
  ): Promise<any> {
    try {
      console.log(`Analyzing website ${url} using Firecrawl via Supabase Edge Function`);
      
      // Add more detailed logging
      console.log('Request parameters:', {
        website_url: url,
        client_name: clientName,
        client_industry: clientIndustry,
        use_firecrawl: true
      });
      
      // Prepare the Supabase client from the exported client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // We'll call our Supabase Edge Function with proper error handling
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: {
          website_url: url,
          client_name: clientName,
          client_industry: clientIndustry,
          use_firecrawl: true,
          system_prompt: "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations.",
          max_response_time: 120, // Set max response time to 120 seconds to avoid timeouts
          test_mode: false // Ensure this is false for real analysis
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Error from edge function: ${error.message || JSON.stringify(error)}`);
      }
      
      console.log('Edge function response:', data);
      
      // Verify that insights were returned
      if (!data || !data.insights || data.insights.length === 0) {
        console.error('No insights returned from edge function');
        throw new Error('No insights returned from website analysis. The API may have failed to extract meaningful content.');
      }
      
      return data;
    } catch (error) {
      console.error('Exception analyzing website via Supabase:', error);
      
      // Provide a more detailed error that includes the type of error
      if (error instanceof Error) {
        // If it's a FunctionsHttpError, it likely means the Edge Function had issues
        if (error.name === 'FunctionsHttpError') {
          throw new Error(`Edge Function error: The server returned an error response. This could be due to a timeout or server-side error. Please try again later.`);
        }
        
        // Network or connection errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(`Network error: Unable to connect to the analysis service. Please check your internet connection and try again.`);
        }
        
        throw error;
      }
      
      throw error;
    }
  }
  
  /**
   * Run a test analysis with test_mode=true
   * This tests the connection without running a full analysis
   */
  static async testWebsiteAnalysis(url: string = "https://example.com"): Promise<any> {
    try {
      console.log('Testing website analysis functionality with test_mode=true');
      
      // Import the supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call edge function with test_mode
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: {
          website_url: url,
          client_name: "Test Client",
          client_industry: "technology",
          test_mode: true // This will return mock data without actually calling Claude
        }
      });
      
      if (error) {
        console.error('Error testing website analysis:', error);
        return {
          success: false,
          error: error.message || 'Unknown error during website analysis test',
          edgeFunctionWorking: false
        };
      }
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Exception testing website analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Test the Claude API configuration via the Edge Function's diagnostic endpoint
   * This helps identify issues with the Claude API integration
   */
  static async testClaudeAPIConfiguration(): Promise<any> {
    try {
      console.log('Testing Claude API configuration via Edge Function...');
      
      // Import the supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call the diagnostic endpoint
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic/diagnose', {
        body: { test: true, timestamp: new Date().toISOString() }
      });
      
      if (error) {
        console.error('Error testing Claude API configuration:', error);
        return {
          success: false,
          error: error.message || 'Unknown error testing API configuration',
          edgeFunctionWorking: false
        };
      }
      
      console.log('Claude API configuration test result:', data);
      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Exception testing Claude API configuration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        edgeFunctionWorking: false
      };
    }
  }
  
  /**
   * Fallback method for direct API access (not recommended)
   */
  static async analyzeWebsiteDirectly(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('No Firecrawl API key found. Please set a key before making API calls.');
    }
    
    try {
      // Direct API call implementation would go here
      console.warn('Direct Firecrawl API access is not recommended.');
      return { error: 'Direct API access not implemented' };
    } catch (error) {
      console.error('Error with direct Firecrawl API access:', error);
      throw error;
    }
  }
}
