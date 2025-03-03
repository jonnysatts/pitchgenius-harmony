
import { fetchWebsiteContentBasic } from './websiteFetcher.ts';

/**
 * Fetch website content using either the Firecrawl API or a basic fallback
 * This is a placeholder for the actual implementation
 */
export async function fetchWebsiteContentWithFirecrawl(url: string): Promise<string> {
  try {
    // For now, we'll use the basic fetcher as a fallback
    // In a future implementation, we could add Firecrawl integration here
    console.log(`Fallback to basic fetch for ${url}`);
    return await fetchWebsiteContentBasic(url);
  } catch (error) {
    console.error('Error in fetchWebsiteContentWithFirecrawl:', error);
    return `Error fetching website content: ${error.message || 'Unknown error'}`;
  }
}
