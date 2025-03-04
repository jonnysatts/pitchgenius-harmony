
/**
 * Service for extracting content from websites
 */
import { extractContentWithFirecrawl } from './firecrawlService.ts';

/**
 * Extract content from a website using an appropriate method
 */
export async function extractWebsiteContent(
  websiteUrl: string,
  useFirecrawl: boolean = true
): Promise<string> {
  console.log(`Extracting content from website: ${websiteUrl}`);
  console.log(`Using Firecrawl: ${useFirecrawl ? 'yes' : 'no'}`);
  
  try {
    // Use Firecrawl for enhanced content extraction if requested
    if (useFirecrawl) {
      return await extractContentWithFirecrawl(websiteUrl);
    }
    
    // Fallback to basic fetch method if Firecrawl is not available or not requested
    return await extractContentWithBasicFetch(websiteUrl);
  } catch (error) {
    console.error(`Error extracting website content: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Failed to extract content from ${websiteUrl}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Basic method to fetch website content using the Fetch API
 */
async function extractContentWithBasicFetch(websiteUrl: string): Promise<string> {
  console.log(`Using basic fetch for ${websiteUrl}`);
  
  try {
    const response = await fetch(websiteUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Very basic HTML to text conversion - this is a fallback method
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`Extracted ${text.length} characters using basic fetch`);
    return text;
  } catch (error) {
    console.error(`Error in basic fetch: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Basic fetch failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
