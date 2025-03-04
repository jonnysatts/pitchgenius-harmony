
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.6.2';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY') || '',
});

/**
 * Generate the structured output format for Claude
 */
export function generateOutputFormat(): string {
  return `
    Structure your response as a JSON array of insights, with exactly one insight for each of these categories:
    - company_positioning (how they present themselves to the market)
    - competitive_landscape (competitors and market position)
    - key_partnerships (specific partners mentioned)
    - public_announcements (specific news items, dates, announcements)
    - consumer_engagement (how they interact with customers)
    - product_service_fit (how their offerings relate to gaming)
    
    Each insight must follow this format:
    {
      "id": "website-[category]-[timestamp]",
      "category": "One of the six categories listed above",
      "confidence": A number between 60-95 representing how confident you are in this insight,
      "needsReview": true if specificity is low, false if highly specific,
      "content": {
        "title": "A specific title based on actual website content",
        "summary": "A concise summary with SPECIFIC details from the website",
        "details": "Detailed explanation with specific facts, numbers, names, or direct quotes from the website",
        "recommendations": "Gaming-specific recommendations based on the details"
      }
    }
    
    If a website has minimal content, still provide insights based on what's available. If content is sparse, focus on the most promising categories and note the limited information.
    `;
}

/**
 * Verify the Anthropic API key is valid and well-formed
 */
export function verifyAnthropicApiKey(): boolean {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  // Check if key exists
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return false;
  }
  
  // Check if key has the expected format (Claude API keys start with 'sk-ant-')
  if (!apiKey.startsWith('sk-ant-')) {
    console.error('ANTHROPIC_API_KEY does not have the expected format (should start with sk-ant-)');
    return false;
  }
  
  // Key passes basic validation
  return true;
}

/**
 * Call Claude API to analyze website content with improved error handling
 */
export async function analyzeWebsiteWithAnthropic(
  websiteContent: string,
  systemPrompt: string,
  clientName: string,
  clientIndustry: string
): Promise<string> {
  try {
    // First verify the API key
    if (!verifyAnthropicApiKey()) {
      throw new Error('Invalid or missing Anthropic API key. Please check your ANTHROPIC_API_KEY in Supabase secrets.');
    }
    
    // Verify we have minimum content
    if (!websiteContent || websiteContent.length < 50) {
      console.error('Website content is too short for analysis:', websiteContent.length);
      throw new Error('Website content is too short or empty for meaningful analysis');
    }

    // Check content size and truncate if needed to avoid API limits
    const maxContentSize = 25000; // Reduce from previous 50k to ensure we don't hit token limits
    const truncatedContent = websiteContent.length > maxContentSize 
      ? websiteContent.substring(0, maxContentSize) + "\n[Content truncated due to size limits]" 
      : websiteContent;

    console.log(`Content prepared for Claude: ${truncatedContent.length} chars`);
    
    // Log a sample of the content
    console.log(`Content sample: ${truncatedContent.substring(0, 200)}...`);

    // Combine the system prompt with the output format
    const fullSystemPrompt = `${systemPrompt}\n\n${generateOutputFormat()}`;
    
    // Call Claude API with improved error handling and logging
    console.log('Making API call to Claude with model: claude-2.1');
    
    // Use a more structured prompt format
    const prompt = `\n\nHuman: I need to analyze this website for a gaming strategy project. The website belongs to ${clientName || "a company"} in the ${clientIndustry} industry. Here's the website content:\n\n${truncatedContent}\n\nPlease analyze this content and generate strategic insights that would be valuable for a gaming company considering a potential partnership. Focus on identifying specific opportunities, challenges, and unique strategic positions.\n\nAssistant:`;
    
    try {
      // Log the request parameters for debugging
      console.log('Claude API request parameters:', {
        model: 'claude-2.1',
        maxTokensToSample: 4000,
        hasSystemPrompt: !!fullSystemPrompt,
        promptLength: prompt.length,
        apiKeyExists: !!Deno.env.get('ANTHROPIC_API_KEY'),
        apiKeyPrefix: Deno.env.get('ANTHROPIC_API_KEY')?.substring(0, 8) + '...'
      });
      
      const completion = await anthropic.completions.create({
        model: 'claude-2.1',
        max_tokens_to_sample: 4000,
        system: fullSystemPrompt,
        prompt: prompt,
        temperature: 0.3
      });
      
      console.log('Claude API call successful, received response');
      
      // Check if we got a valid response
      if (!completion || !completion.completion) {
        console.error('Claude response was empty or invalid');
        throw new Error('Claude API returned an empty response');
      }
      
      console.log(`Claude response length: ${completion.completion.length} chars`);
      console.log(`Claude response sample: ${completion.completion.substring(0, 200)}...`);
      
      return completion.completion;
    } catch (apiError) {
      // Log detailed error information
      console.error('Claude API error details:', typeof apiError === 'object' ? JSON.stringify(apiError) : apiError);
      
      // Try to extract more useful error information for different types of errors
      let errorMessage = 'Unknown Claude API error';
      
      if (apiError.toString().includes('invalid_request_error')) {
        errorMessage = `Claude API invalid request: ${apiError.message || 'Check API format and parameters'}`;
      } else if (apiError.toString().includes('authentication')) {
        errorMessage = `Claude API authentication error: ${apiError.message || 'Invalid API key'}`;
      } else if (apiError.toString().includes('rate_limit')) {
        errorMessage = `Claude API rate limit exceeded: ${apiError.message || 'Too many requests'}`;
      } else if (apiError.toString().includes('context_length')) {
        errorMessage = `Claude API context length exceeded: ${apiError.message || 'Input too long'}`;
      } else if (typeof apiError === 'object' && apiError !== null) {
        errorMessage = apiError.message || JSON.stringify(apiError);
      } else {
        errorMessage = String(apiError);
      }
      
      throw new Error(`Claude API error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error in analyzeWebsiteWithAnthropic:', error);
    throw error;
  }
}
