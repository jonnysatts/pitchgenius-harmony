
/**
 * Service for interacting with Firecrawl API to extract website content
 */

/**
 * Extract website content using Firecrawl API
 */
export async function extractContentWithFirecrawl(websiteUrl: string): Promise<string> {
  console.log(`Extracting content from ${websiteUrl} with Firecrawl`);
  
  // Check if we have the Firecrawl API key
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KPI') || Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlApiKey) {
    console.warn('FIRECRAWL_API_KEY or FIRECRAWL_API_KPI not found in environment');
    throw new Error('Firecrawl API key not found in environment variables');
  }
  
  try {
    console.log('Making request to Firecrawl API...');
    
    // Make a request to the Firecrawl API
    const response = await fetch('https://api.firecrawl.dev/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: JSON.stringify({
        url: websiteUrl,
        limit: 20,  // Number of pages to crawl
        format: 'markdown',
        // Add any additional options needed
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firecrawl API error (${response.status}): ${errorText}`);
      throw new Error(`Firecrawl API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract content from Firecrawl response
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.error('Invalid response from Firecrawl:', data);
      throw new Error('Invalid response from Firecrawl API');
    }
    
    // Combine all page contents into one string
    let allContent = '';
    
    for (const page of data.results) {
      if (page && page.content) {
        allContent += page.content + '\n\n';
      }
    }
    
    console.log(`Extracted ${allContent.length} characters from ${data.results.length} pages`);
    
    return allContent.trim();
  } catch (error) {
    console.error(`Error in Firecrawl extraction: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Firecrawl extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
