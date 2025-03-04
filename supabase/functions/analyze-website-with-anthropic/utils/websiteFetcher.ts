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
        
        // Try to get the error response text if available
        try {
          const errorText = await response.text();
          console.error(`Error response text: ${errorText.substring(0, 500)}`);
        } catch (e) {
          console.error(`Could not read error text: ${e}`);
        }
        
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
          } else {
            // Try to get alternative information from website
            const alternativeUrl = `${urlWithProtocol}/about` || `${urlWithProtocol}/about-us`;
            console.log(`Trying alternative URL: ${alternativeUrl}`);
            
            try {
              const altResponse = await fetch(alternativeUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; GameAnalytics/1.0; +https://example.com)'
                }
              });
              
              if (altResponse.ok) {
                const altHtml = await altResponse.text();
                if (altHtml.length > 500) {
                  return cleanHtml(altHtml);
                }
              }
            } catch (altError) {
              console.error(`Error fetching alternative URL: ${altError}`);
            }
          }
        }
        
        // If we still can't get content, try to extract anything from the error page
        const errorPageContent = await response.text();
        if (errorPageContent.length > 500) {
          console.log("Attempting to extract content from error page");
          const cleanedErrorPage = cleanHtml(errorPageContent);
          if (cleanedErrorPage.length > 500) {
            return cleanedErrorPage + "\n[Note: This content was extracted from an error page as the main website couldn't be accessed]";
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
        return `The website at ${urlWithProtocol} appears to have very limited content. Only ${html.length} characters were found. This may be a placeholder site, under construction, or have content loaded dynamically via JavaScript which cannot be captured by this basic scraper.`;
      }
      
      // More sophisticated HTML cleaning
      const cleanText = cleanHtml(html);
      
      if (cleanText.length < 200) {
        console.warn(`Warning: Cleaned content is very short (${cleanText.length} chars)`);
        // Try to get alternate content from metadata
        const metaDescription = html.match(/<meta name="description" content="([^"]+)"/i);
        const title = html.match(/<title>([^<]+)<\/title>/i);
        
        let extraContent = "";
        if (title && title[1]) {
          extraContent += `Page Title: ${title[1]}\n\n`;
        }
        if (metaDescription && metaDescription[1]) {
          extraContent += `Meta Description: ${metaDescription[1]}\n\n`;
        }
        
        return extraContent + cleanText + `\n\nNote: Limited content was found on this website (${cleanText.length} characters). The site may use JavaScript to load content dynamically or might be a simple landing page.`;
      }
      
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
    
    // Extract important metadata first
    let metadata = '';
    
    // Get page title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      metadata += `PAGE TITLE: ${titleMatch[1].trim()}\n\n`;
    }
    
    // Get meta description
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descriptionMatch && descriptionMatch[1]) {
      metadata += `META DESCRIPTION: ${descriptionMatch[1].trim()}\n\n`;
    }
    
    // Get meta keywords
    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
    if (keywordsMatch && keywordsMatch[1]) {
      metadata += `META KEYWORDS: ${keywordsMatch[1].trim()}\n\n`;
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
    
    // Preserve important content from headings
    const headingMatches = cleaned.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    let headings = '';
    for (const match of headingMatches) {
      if (match[1] && match[1].trim() && !match[1].includes('<') && match[1].length > 2) {
        headings += `HEADING: ${match[1].trim()}\n`;
      }
    }
    
    if (headings) {
      headings = "\nPAGE HEADINGS:\n" + headings + "\n";
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
    
    // Add the metadata and headings at the beginning
    const finalText = metadata + headings + cleaned;
    
    console.log(`HTML cleaning complete. Reduced from ${html.length} to ${finalText.length} chars`);
    
    return finalText;
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    return html; // Return original HTML if cleaning fails
  }
}
