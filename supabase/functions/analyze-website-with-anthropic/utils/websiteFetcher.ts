
/**
 * Utilities for fetching website content
 */

/**
 * Fetch website content using basic fetch (fallback method)
 */
export async function fetchWebsiteContentBasic(url: string): Promise<string> {
  try {
    console.log(`Falling back to basic fetch for ${url}`);
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StrategicAnalysisBot/1.0; +https://example.com)'
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching website: ${response.status} ${response.statusText}`);
      return `Error fetching website content: ${response.status} ${response.statusText}`;
    }
    
    const html = await response.text();
    console.log(`Successfully fetched ${html.length} bytes of content with basic fetch`);
    
    // Very basic HTML cleaning - extract text content
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Return the first 100,000 characters to avoid overwhelming Claude
    return textContent.slice(0, 100000);
  } catch (error) {
    console.error('Error fetching website content:', error);
    return `Error fetching website content: ${error.message || 'Unknown error'}`;
  }
}
