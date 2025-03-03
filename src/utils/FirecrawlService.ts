
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
    // We can't directly use Firecrawl on client-side,
    // so we'll just do simple validation for now
    return apiKey && apiKey.length > 10;
  }

  /**
   * Analyze a website using Firecrawl via Supabase Edge Function
   * This is the preferred method as it uses the API key from Supabase secrets
   */
  static async analyzeWebsiteViaSupabase(url: string, projectId: string, clientName: string, clientIndustry: string): Promise<any> {
    try {
      console.log(`Analyzing website ${url} using Firecrawl via Supabase Edge Function`);
      
      // We'll call our Supabase Edge Function that will use the Firecrawl API key from secrets
      const { data, error } = await fetch(`https://nryafptwknnftdjugoyn.supabase.co/functions/v1/analyze-website-with-anthropic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeWFmcHR3a25uZnRkanVnb3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MjA5MjksImV4cCI6MjA1NjM5NjkyOX0.6ixFQDUWcBw7Z3LQW6-uehPCza286BV9HDmHnNrM_vw'}`
        },
        body: JSON.stringify({
          projectId,
          clientWebsite: url,
          clientName,
          clientIndustry,
          systemPrompt: "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations."
        })
      }).then(res => res.json());
      
      if (error) {
        console.error('Error analyzing website via Supabase:', error);
        throw new Error(`Error analyzing website: ${error.message || JSON.stringify(error)}`);
      }
      
      return data;
    } catch (error) {
      console.error('Exception analyzing website via Supabase:', error);
      throw error;
    }
  }
}
