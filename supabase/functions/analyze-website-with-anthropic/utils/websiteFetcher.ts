/**
 * Basic utility to fetch website content 
 * Used when Firecrawl is not available
 */
export async function fetchWebsiteContentBasic(url: string): Promise<string> {
  try {
    console.log(`Fetching content from ${url} using basic fetch`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    console.log(`Using URL with protocol: ${urlWithProtocol}`);
    
    // Simple fetch of the website HTML with extended timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`Aborting fetch for ${urlWithProtocol} due to timeout`);
      controller.abort();
    }, 30000); // 30 second timeout
    
    console.log(`Starting fetch request to ${urlWithProtocol}...`);
    
    try {
      const response = await fetch(urlWithProtocol, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GameAnalytics/1.0; +https://example.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Fetch response received with status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch website: ${response.status} ${response.statusText}`);
        
        // Try again with www prefix if the domain doesn't already have it
        if (!urlWithProtocol.includes("://www.") && (response.status === 404 || response.status === 403)) {
          const wwwUrl = urlWithProtocol.replace("://", "://www.");
          console.log(`Retrying with www prefix: ${wwwUrl}`);
          
          const wwwResponse = await fetch(wwwUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; GameAnalytics/1.0; +https://example.com)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            }
          });
          
          if (wwwResponse.ok) {
            const html = await wwwResponse.text();
            console.log(`Successfully fetched raw HTML content with www prefix (${html.length} chars)`);
            
            if (html.length < 100) {
              console.warn("Warning: Very short HTML content received");
            }
            
            // More sophisticated HTML cleaning
            const cleanText = cleanHtml(html);
            
            console.log(`Successfully cleaned content to (${cleanText.length} chars)`);
            
            // Return a limited amount of text - Claude has context limits
            return cleanText.slice(0, 50000);
          }
        }
        
        throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
      }
      
      // Get website text
      const html = await response.text();
      console.log(`Successfully fetched raw HTML content (${html.length} chars)`);
      console.log(`First 100 chars of HTML: ${html.substring(0, 100)}`);
      
      if (html.length < 100) {
        console.warn("Warning: Very short HTML content received");
      }
      
      // More sophisticated HTML cleaning
      const cleanText = cleanHtml(html);
      
      console.log(`Successfully cleaned content to (${cleanText.length} chars)`);
      console.log(`First 100 chars of cleaned text: ${cleanText.substring(0, 100)}`);
      
      // Return a limited amount of text - Claude has context limits
      return cleanText.slice(0, 50000);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`Error during fetch: ${fetchError.message}`);
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error fetching website with basic fetch:`, error);
    if (error.name === 'AbortError') {
      return `Error fetching website content: Request timed out after 30 seconds. The website might be too slow or blocking our requests.`;
    }
    return `Error fetching website content: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * More sophisticated HTML cleaning function
 */
function cleanHtml(html: string): string {
  try {
    console.log('Starting HTML cleaning process...');
    
    // Quick check if content seems to be JSON instead of HTML
    if (html.trim().startsWith('{') && html.trim().endsWith('}')) {
      try {
        const jsonData = JSON.parse(html);
        console.log('Content appears to be JSON, converting to plaintext');
        return `JSON Data: ${JSON.stringify(jsonData, null, 2)}`;
      } catch (e) {
        // Not valid JSON, continue with HTML cleaning
      }
    }
    
    // Check if it might be a text/plain response instead of HTML
    if (!html.includes('<html') && !html.includes('<body') && !html.includes('<div')) {
      console.log('Content appears to be plain text rather than HTML');
      return html.trim().slice(0, 50000);
    }
    
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
    
    // Add newline before headings for better readability
    cleaned = cleaned.replace(/<(h1|h2|h3|h4|h5|h6)[^>]*>/gi, '\n\n');
    
    // Get content from title tag if available
    const titleMatch = cleaned.match(/<title[^>]*>(.*?)<\/title>/i);
    let title = '';
    if (titleMatch && titleMatch[1]) {
      title = `PAGE TITLE: ${titleMatch[1].trim()}\n\n`;
    }
    
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
    
    // Add the title at the beginning if found
    if (title) {
      cleaned = title + cleaned;
    }
    
    console.log(`HTML cleaning complete. Reduced from ${html.length} to ${cleaned.length} chars`);
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    return html; // Return original HTML if cleaning fails
  }
}
