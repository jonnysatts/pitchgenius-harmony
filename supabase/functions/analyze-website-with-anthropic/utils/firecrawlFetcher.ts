
/**
 * Enhanced website content fetching using Firecrawl API
 */
import { fetchWebsiteContentBasic } from './websiteFetcher.ts';

/**
 * Fetch website content using Firecrawl API
 * If Firecrawl fails, fall back to basic fetching
 */
export async function fetchFirecrawlContent(url: string): Promise<string> {
  // Check for API key under both possible names (original and typo version)
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KPI');
  
  // Debug the actual key being used (partial for security)
  if (firecrawlApiKey) {
    const safeKeyPreview = firecrawlApiKey.substring(0, 3) + '...' + firecrawlApiKey.substring(firecrawlApiKey.length - 4);
    console.log(`Using Firecrawl API key (preview): ${safeKeyPreview}`);
  } else {
    console.log(`No Firecrawl API key found, using basic fetch for ${url}`);
    return await fetchWebsiteContentBasic(url);
  }
  
  try {
    console.log(`Using Firecrawl API to fetch ${url}`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
    console.log(`Making request to Firecrawl API for: ${urlWithProtocol}`);
    
    // Create timeout signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    const response = await fetch('https://api.firecrawl.dev/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: JSON.stringify({
        url: urlWithProtocol,
        limit: 10, // Limit pages to crawl
        options: {
          formats: ['markdown', 'text'],
          include_images: false,
          wait_for_selectors: ['p', 'h1', 'h2', 'li'] // Wait for content to load
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`);
      console.log('Falling back to basic fetch');
      return await fetchWebsiteContentBasic(url);
    }
    
    const data = await response.json();
    console.log(`Firecrawl API response status: ${data.success ? 'success' : 'failed'}`);
    
    if (data.success && data.data && data.data.length > 0) {
      // Combine all content from crawled pages
      let combinedContent = '';
      
      console.log(`Firecrawl returned ${data.data.length} pages of content`);
      
      for (const page of data.data) {
        if (page.markdown) {
          combinedContent += `\n\n## ${page.url}\n\n${page.markdown}`;
        } else if (page.text) {
          combinedContent += `\n\n## ${page.url}\n\n${page.text}`;
        }
      }
      
      const contentLength = combinedContent.length;
      console.log(`Successfully fetched content with Firecrawl (${contentLength} chars)`);
      
      // Limit content length for Claude's context window
      const maxContentLength = 25000;
      const truncatedContent = combinedContent.length > maxContentLength 
        ? combinedContent.substring(0, maxContentLength) + "\n\n[Content truncated due to size limits]" 
        : combinedContent;
      
      if (truncatedContent.length < contentLength) {
        console.log(`Content truncated from ${contentLength} to ${truncatedContent.length} chars for Claude's context window`);
      }
      
      return truncatedContent;
    } else {
      console.error('No content returned from Firecrawl, response:', JSON.stringify(data).substring(0, 200));
      console.log('Falling back to basic fetch');
      return await fetchWebsiteContentBasic(url);
    }
  } catch (error) {
    console.error('Error using Firecrawl API, falling back to basic fetch:', error);
    return await fetchWebsiteContentBasic(url);
  }
}
