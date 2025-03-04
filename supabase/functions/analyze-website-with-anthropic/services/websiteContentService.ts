
/**
 * Service for fetching website content
 */
import { fetchWebsiteContentBasic } from '../utils/websiteFetcher.ts';
import { fetchFirecrawlContent } from '../utils/firecrawlFetcher.ts';

/**
 * Main function for fetching website content
 * Decides whether to use Firecrawl or basic fetching
 */
export async function fetchWebsiteContent(url: string, useFirecrawl: boolean = false): Promise<string> {
  console.log(`Fetching website content for ${url} using ${useFirecrawl ? 'Firecrawl' : 'basic fetch'}`);
  
  try {
    // Validate URL
    if (!url || url.trim() === '') {
      throw new Error('No website URL provided');
    }
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
    // Choose fetching method based on useFirecrawl flag
    if (useFirecrawl) {
      return await fetchFirecrawlContent(urlWithProtocol);
    } else {
      return await fetchWebsiteContentBasic(urlWithProtocol);
    }
  } catch (error) {
    console.error(`Error fetching website content: ${error.message}`);
    throw error;
  }
}
