
import { fetchWebsiteContentBasic } from './websiteFetcher.ts';

/**
 * Fetch website content using Firecrawl API
 * If Firecrawl fails, fall back to basic fetching
 */
export async function fetchWebsiteContentWithFirecrawl(url: string): Promise<string> {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  // If no API key is available, use basic fetch
  if (!firecrawlApiKey) {
    console.log(`No Firecrawl API key found, using basic fetch for ${url}`);
    return await fetchWebsiteContentBasic(url);
  }
  
  try {
    console.log(`Using Firecrawl API to fetch ${url}`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
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
          include_images: false
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      // Combine all content from crawled pages
      let combinedContent = '';
      
      for (const page of data.data) {
        if (page.markdown) {
          combinedContent += `\n\n## ${page.url}\n\n${page.markdown}`;
        } else if (page.text) {
          combinedContent += `\n\n## ${page.url}\n\n${page.text}`;
        }
      }
      
      console.log(`Successfully fetched content with Firecrawl (${combinedContent.length} chars)`);
      // Limit content length for Claude's context window
      return combinedContent.slice(0, 90000);
    } else {
      throw new Error('No content returned from Firecrawl');
    }
  } catch (error) {
    console.error('Error using Firecrawl API, falling back to basic fetch:', error);
    return await fetchWebsiteContentBasic(url);
  }
}
