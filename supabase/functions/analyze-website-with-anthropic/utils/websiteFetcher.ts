
/**
 * Basic utility to fetch website content 
 * Used when Firecrawl is not available
 */
export async function fetchWebsiteContentBasic(url: string): Promise<string> {
  try {
    console.log(`Fetching content from ${url} using basic fetch`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
    // Simple fetch of the website HTML
    const response = await fetch(urlWithProtocol, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GameAnalytics/1.0; +https://example.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }
    
    // Get website text
    const html = await response.text();
    
    // Very basic HTML cleaning 
    // In a production environment, you'd want a more sophisticated HTML-to-text converter
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s{2,}/g, ' ');
    
    console.log(`Successfully fetched basic content (${cleanText.length} chars)`);
    
    // Return a limited amount of text - Claude has context limits
    return cleanText.slice(0, 50000);
  } catch (error) {
    console.error(`Error fetching website with basic fetch:`, error);
    return `Error fetching website content: ${error.message || 'Unknown error'}`;
  }
}
