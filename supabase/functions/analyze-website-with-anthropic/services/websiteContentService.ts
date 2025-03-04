/**
 * Service for extracting content from websites
 */
import { extractContentWithFirecrawl } from './firecrawlService.ts';
import { fetchFirecrawlContent } from '../utils/firecrawlFetcher.ts';

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
    // Try the improved firecrawlFetcher first which has its own fallbacks
    try {
      console.log('Using enhanced Firecrawl fetcher with fallbacks');
      const content = await fetchFirecrawlContent(websiteUrl);
      if (content && content.length > 100) {
        console.log(`Successfully extracted ${content.length} characters using enhanced fetcher`);
        return content;
      }
    } catch (fetcherError) {
      console.warn('Enhanced fetcher failed, trying alternative methods:', fetcherError);
    }
    
    // Use Firecrawl for enhanced content extraction if requested
    if (useFirecrawl) {
      try {
        const content = await extractContentWithFirecrawl(websiteUrl);
        console.log(`Successfully extracted ${content.length} characters with Firecrawl`);
        return content;
      } catch (firecrawlError) {
        console.warn('Firecrawl extraction failed, falling back to basic method:', firecrawlError);
      }
    }
    
    // Fallback to basic fetch method
    console.log('Falling back to basic extraction method');
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
    // Ensure URL has protocol
    const urlWithProtocol = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    // Create timeout signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(urlWithProtocol, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
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
    
    // If text is too short, try to extract more targeted content from HTML
    if (text.length < 1000) {
      console.log('Basic fetch extracted less than 1000 characters, trying to enhance extraction');
      const enhancedText = extractRelevantContent(html, websiteUrl);
      if (enhancedText.length > text.length) {
        console.log(`Enhanced extraction yielded ${enhancedText.length} characters`);
        return enhancedText;
      }
    }
    
    return text;
  } catch (error) {
    console.error(`Error in basic fetch: ${error instanceof Error ? error.message : String(error)}`);
    
    // Return minimal content to prevent failing entirely
    return `Failed to extract content from ${websiteUrl} due to: ${error instanceof Error ? error.message : String(error)}. Please try again later or check the website URL.`;
  }
}

/**
 * Extract more relevant content from HTML by targeting common content containers
 */
function extractRelevantContent(html: string, websiteUrl: string): string {
  try {
    // Target common content container elements
    const contentContainers = [
      /<main\b[^>]*>(.*?)<\/main>/is,
      /<article\b[^>]*>(.*?)<\/article>/is,
      /<div\b[^>]*content[^>]*>(.*?)<\/div>/is,
      /<div\b[^>]*main[^>]*>(.*?)<\/div>/is,
      /<div class="container"[^>]*>(.*?)<\/div>/is
    ];
    
    let combinedContent = '';
    
    // Extract content from targeted containers
    for (const regex of contentContainers) {
      const matches = html.match(regex);
      if (matches && matches.length > 1) {
        const extractedText = matches[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        combinedContent += extractedText + '\n\n';
      }
    }
    
    // Extract heading tags for main topics
    const headings = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
    if (headings) {
      combinedContent += 'Main topics on the website:\n';
      for (const heading of headings) {
        const cleanHeading = heading
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanHeading) {
          combinedContent += `- ${cleanHeading}\n`;
        }
      }
    }
    
    // Add website metadata
    combinedContent += `\nWebsite URL: ${websiteUrl}\n`;
    
    const title = html.match(/<title>(.*?)<\/title>/i);
    if (title && title[1]) {
      combinedContent += `Title: ${title[1].trim()}\n`;
    }
    
    const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i);
    if (description && description[1]) {
      combinedContent += `Description: ${description[1].trim()}\n`;
    }
    
    return combinedContent.trim();
  } catch (error) {
    console.error('Error in enhanced content extraction:', error);
    return '';
  }
}
