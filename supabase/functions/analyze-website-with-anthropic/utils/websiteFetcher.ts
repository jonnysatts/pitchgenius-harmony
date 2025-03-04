/**
 * Basic utility to fetch website content 
 * Used when Firecrawl is not available
 */
export async function fetchWebsiteContentBasic(url: string): Promise<string> {
  try {
    console.log(`Fetching content from ${url} using basic fetch`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
    // Simple fetch of the website HTML with extended timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(urlWithProtocol, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GameAnalytics/1.0; +https://example.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Failed to fetch website: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }
    
    // Get website text
    const html = await response.text();
    console.log(`Successfully fetched raw HTML content (${html.length} chars)`);
    
    if (html.length < 100) {
      console.warn("Warning: Very short HTML content received");
    }
    
    // More sophisticated HTML cleaning
    const cleanText = cleanHtml(html);
    
    console.log(`Successfully cleaned content to (${cleanText.length} chars)`);
    
    // Return a limited amount of text - Claude has context limits
    return cleanText.slice(0, 50000);
  } catch (error) {
    console.error(`Error fetching website with basic fetch:`, error);
    return `Error fetching website content: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * More sophisticated HTML cleaning function
 */
function cleanHtml(html: string): string {
  try {
    // Remove script tags and their content
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    
    // Remove style tags and their content
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    
    // Remove SVG tags and their content
    cleaned = cleaned.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
    
    // Remove meta tags
    cleaned = cleaned.replace(/<meta\b[^<]*(?:(?!>)<[^<]*)*>/gi, ' ');
    
    // Replace common HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    
    // Replace div, p, h1, h2, h3, h4, h5, h6, tr, li with newlines before removal
    cleaned = cleaned.replace(/<\/(div|p|h1|h2|h3|h4|h5|h6|tr|li)>/gi, '\n');
    
    // Replace br, hr tags with newlines
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
    cleaned = cleaned.replace(/<hr\s*\/?>/gi, '\n---\n');
    
    // Keep content of specific tags that might contain important text but remove the tags
    cleaned = cleaned.replace(/<(a|span|strong|em|b|i|u|label)[^>]*>/gi, '');
    cleaned = cleaned.replace(/<\/(a|span|strong|em|b|i|u|label)>/gi, '');
    
    // Now remove all remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    // Normalize newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    return html; // Return original HTML if cleaning fails
  }
}
