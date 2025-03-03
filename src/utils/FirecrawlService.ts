
/**
 * Service for interacting with Firecrawl API
 */

// Don't directly import Firecrawl on the client-side as it may cause issues
// We'll create our own implementation that's browser-safe
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
    // Without directly importing the Firecrawl API,
    // we'll just do a simple validation for now
    // This would be replaced with actual API validation in a real implementation
    return apiKey && apiKey.length > 10;
  }
}
