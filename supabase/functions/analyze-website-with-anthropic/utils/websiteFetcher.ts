
/**
 * Basic website content fetching implementation
 */

/**
 * Fetch website content using basic fetch API
 * @param url The website URL to fetch
 * @returns The website content as a string
 */
export async function fetchWebsiteContentBasic(url: string): Promise<string> {
  try {
    console.log(`Fetching website content from ${url} using basic fetch`);
    
    // Ensure URL has protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(urlWithProtocol, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.warn(`Warning: Content type is not HTML: ${contentType}`);
    }
    
    const html = await response.text();
    
    // Extract text content from HTML
    const textContent = extractTextFromHtml(html);
    
    console.log(`Successfully fetched ${textContent.length} characters of content from ${url}`);
    
    return textContent;
  } catch (error) {
    console.error(`Error fetching website content from ${url}:`, error);
    throw new Error(`Failed to fetch website content: ${error.message}`);
  }
}

/**
 * Extract text content from HTML
 * @param html The HTML string
 * @returns Cleaned text content
 */
function extractTextFromHtml(html: string): string {
  try {
    // Remove scripts and styles first to prevent their content from being included
    const withoutScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    const withoutStyles = withoutScripts.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    
    // Extract meta description if available
    const metaDescription = withoutStyles.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const metaDescriptionText = metaDescription ? `Description: ${metaDescription[1]}\n\n` : '';
    
    // Extract title
    const titleMatch = withoutStyles.match(/<title[^>]*>([^<]*)<\/title>/i);
    const titleText = titleMatch ? `Title: ${titleMatch[1]}\n\n` : '';
    
    // Extract headings
    const headings = [];
    const h1Matches = withoutStyles.matchAll(/<h1[^>]*>([^<]*)<\/h1>/gi);
    for (const match of h1Matches) {
      headings.push(`Heading: ${match[1].trim()}`);
    }
    
    const h2Matches = withoutStyles.matchAll(/<h2[^>]*>([^<]*)<\/h2>/gi);
    for (const match of h2Matches) {
      headings.push(`Subheading: ${match[1].trim()}`);
    }
    
    const headingsText = headings.length > 0 ? headings.join('\n') + '\n\n' : '';
    
    // Extract text from paragraphs and lists
    const paragraphs = [];
    const pMatches = withoutStyles.matchAll(/<p[^>]*>([^<]*)<\/p>/gi);
    for (const match of pMatches) {
      if (match[1].trim().length > 0) {
        paragraphs.push(match[1].trim());
      }
    }
    
    // Extract list items
    const listItems = [];
    const liMatches = withoutStyles.matchAll(/<li[^>]*>([^<]*)<\/li>/gi);
    for (const match of liMatches) {
      if (match[1].trim().length > 0) {
        listItems.push(`• ${match[1].trim()}`);
      }
    }
    
    const listItemsText = listItems.length > 0 ? listItems.join('\n') + '\n\n' : '';
    
    // Extract text from divs if we have little content
    let divTexts = '';
    if (paragraphs.length < 5) {
      const divMatches = withoutStyles.matchAll(/<div[^>]*>([^<]*)<\/div>/gi);
      const divs = [];
      for (const match of divMatches) {
        if (match[1].trim().length > 20) { // Only include divs with substantial text
          divs.push(match[1].trim());
        }
      }
      divTexts = divs.length > 0 ? divs.join('\n\n') + '\n\n' : '';
    }
    
    // Combine all text parts
    let textContent = titleText + metaDescriptionText + headingsText + 
                      paragraphs.join('\n\n') + '\n\n' + listItemsText + divTexts;
    
    // Clean up the text
    textContent = textContent
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    
    // As a last resort, if we have very little content, just strip all HTML tags
    if (textContent.length < 200) {
      console.log('Extracted too little content, falling back to stripping all HTML tags');
      textContent = withoutStyles
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    return textContent;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    // Fallback to simply removing HTML tags
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
