
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@0.0.1';
import { fetchWebsiteContentBasic } from './websiteFetcher.ts';

// Initialize Firecrawl client
const firecrawl = new FirecrawlApp({
  apiKey: Deno.env.get('FIRECRAWL_API_KEY') || '',
});

/**
 * Fetch website content using Firecrawl (primary method)
 */
export async function fetchWebsiteContentWithFirecrawl(url: string): Promise<string> {
  try {
    console.log(`Fetching content from ${url} using Firecrawl`);
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Check if Firecrawl API key is available
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.log('No Firecrawl API key found, falling back to basic fetch');
      return await fetchWebsiteContentBasic(fullUrl);
    }
    
    console.log('Using Firecrawl to scrape website');
    
    // Crawl the website with Firecrawl
    const crawlResponse = await firecrawl.crawlUrl(fullUrl, {
      limit: 50, // Limit to 50 pages for reasonable crawling
      scrapeOptions: {
        formats: ['markdown'],
      }
    });
    
    if (!crawlResponse.success) {
      console.error('Firecrawl error:', crawlResponse.error);
      throw new Error(`Firecrawl error: ${crawlResponse.error}`);
    }
    
    console.log(`Successfully fetched ${crawlResponse.data.length} pages with Firecrawl`);
    
    // Compile all the content from crawled pages
    let combinedContent = '';
    for (const page of crawlResponse.data) {
      combinedContent += `\n\n## Page: ${page.url}\n${page.markdown || page.text || ''}\n`;
    }
    
    // Return the first 100,000 characters to avoid overwhelming Claude
    return combinedContent.slice(0, 100000);
  } catch (error) {
    console.error('Error using Firecrawl:', error);
    console.log('Falling back to basic fetch...');
    return await fetchWebsiteContentBasic(url);
  }
}
