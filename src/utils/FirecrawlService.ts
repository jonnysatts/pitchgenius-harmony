
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
          system_prompt: "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations."
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Error from edge function: ${error.message || JSON.stringify(error)}`);
      }
      
      console.log('Edge function response:', data);
      return data;
    } catch (error) {
      console.error('Exception analyzing website via Supabase:', error);
      throw error;
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
