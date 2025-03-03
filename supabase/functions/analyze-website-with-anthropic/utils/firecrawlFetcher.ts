
import { fetchWebsiteContentBasic } from './websiteFetcher.ts';

/**
 * Fetch website content using a basic fallback approach
 * This is simplified to avoid dependency issues
 */
export async function fetchWebsiteContentWithFirecrawl(url: string): Promise<string> {
  try {
    console.log(`Using basic fetch for ${url}`);
    return await fetchWebsiteContentBasic(url);
  } catch (error) {
    console.error('Error in fetchWebsiteContentWithFirecrawl:', error);
    return `Error fetching website content: ${error.message || 'Unknown error'}`;
  }
}
