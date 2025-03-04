
/**
 * Service for interacting with Firecrawl API to extract website content
 */

/**
 * Extract website content using Firecrawl API
 */
export async function extractContentWithFirecrawl(websiteUrl: string): Promise<string> {
  console.log(`Extracting content from ${websiteUrl} with Firecrawl`);
  
  // Check if we have the Firecrawl API key (checking both possible environment variable names)
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KPI');
  
  if (!firecrawlApiKey) {
    console.warn('FIRECRAWL_API_KEY or FIRECRAWL_API_KPI not found in environment');
    throw new Error('Firecrawl API key not found in environment variables');
  }
  
  // Log the key being used (safely)
  const keySource = Deno.env.get('FIRECRAWL_API_KEY') ? 'FIRECRAWL_API_KEY' : 'FIRECRAWL_API_KPI';
  const keyPrefix = firecrawlApiKey.substring(0, 5) + '...';
  console.log(`Using ${keySource} with prefix: ${keyPrefix}`);
  
  try {
    console.log('Making request to Firecrawl API...');
    
    // Prepare the request URL
    const apiUrl = 'https://api.firecrawl.dev/crawl';
    console.log(`API endpoint: ${apiUrl}`);
    
    // Make a request to the Firecrawl API
    const response = await fetch(apiUrl, {
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
    
    console.log(`Firecrawl API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firecrawl API error (${response.status}): ${errorText}`);
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    console.log('Firecrawl API response data structure:', Object.keys(data));
    
    // Extract content from Firecrawl response
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.error('Invalid response from Firecrawl:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid response from Firecrawl API');
    }
    
    // Combine all page contents into one string
    let allContent = '';
    
    for (const page of data.results) {
      if (page && page.content) {
        allContent += `\n\n## Page: ${page.url || 'Unknown URL'}\n\n${page.content}\n\n`;
      }
    }
    
    console.log(`Extracted ${allContent.length} characters from ${data.results.length} pages`);
    
    return allContent.trim();
  } catch (error) {
    console.error(`Error in Firecrawl extraction: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Falling back to basic website extraction');
    // Return a more detailed error message that will be handled upstream
    throw new Error(`Firecrawl extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
