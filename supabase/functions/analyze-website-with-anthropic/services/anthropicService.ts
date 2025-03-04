
// Removed the SDK import and using fetch directly instead
// Previously: import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.9.0';

/**
 * Generate the structured output format for Claude
 */
export function generateOutputFormat(): string {
  return `
    Analyze the website content and provide insights in the following categories:
    - company_positioning (how they present themselves to the market)
    - competitive_landscape (competitors and market position)
    - key_partnerships (specific partners mentioned)
    - public_announcements (specific news items, dates, announcements)
    - consumer_engagement (how they interact with customers)
    - product_service_fit (how their offerings relate to gaming)
    
    Structure your response as a JSON array of insights with this format:
    [
      {
        "id": "website-[category]-[timestamp]",
        "category": "One of the six categories listed above",
        "confidence": A number between 60-95,
        "needsReview": boolean,
        "content": {
          "title": "A specific title based on website content",
          "summary": "A concise summary with specific details",
          "details": "Detailed explanation with specific facts from the website",
          "recommendations": "Gaming-specific recommendations"
        }
      }
    ]
    
    If a website has minimal content, still provide insights based on what's available.
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
  
  console.log('API key verification passed');
  return true;
}

/**
 * Call Claude API to analyze website content with improved error handling
 * Using direct fetch approach instead of the SDK
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
    console.log('Making API call to Claude with model: claude-3-sonnet-20240229');
    
    // Create the user prompt
    const userPrompt = `I need to analyze this website for a gaming strategy project. The website belongs to ${clientName || "a company"} in the ${clientIndustry} industry. Here's the website content:\n\n${truncatedContent}\n\nPlease analyze this content and generate strategic insights that would be valuable for a gaming company considering a potential partnership.`;
    
    try {
      // Log the request parameters for debugging
      console.log('Claude API request parameters:', {
        model: 'claude-3-sonnet-20240229',
        maxTokens: 4000,
        hasSystemPrompt: !!fullSystemPrompt,
        systemPromptLength: fullSystemPrompt.length,
        userPromptLength: userPrompt.length,
        apiKeyExists: !!Deno.env.get('ANTHROPIC_API_KEY'),
        apiKeyPrefix: Deno.env.get('ANTHROPIC_API_KEY')?.substring(0, 8) + '...'
      });
      
      // Use fetch directly instead of the SDK
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: fullSystemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', errorText);
        throw new Error(`Claude API HTTP error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Claude API call successful, received response');
      
      // Check if we got a valid response
      if (!data || !data.content || data.content.length === 0) {
        console.error('Claude response was empty or invalid');
        throw new Error('Claude API returned an empty response');
      }
      
      const responseText = data.content[0].text;
      console.log(`Claude response length: ${responseText.length} chars`);
      console.log(`Claude response sample: ${responseText.substring(0, 200)}...`);
      
      return responseText;
    } catch (apiError: any) {
      // Log detailed error information
      console.error('Claude API error details:', typeof apiError === 'object' ? JSON.stringify(apiError) : apiError);
      
      // Enhanced error handling with more specific error messages
      let errorMessage = 'Unknown Claude API error';
      
      if (typeof apiError === 'object' && apiError !== null) {
        // Extract the most useful error information
        if (apiError.status) {
          errorMessage = `Claude API HTTP error: ${apiError.status}`;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else {
          errorMessage = JSON.stringify(apiError);
        }
      } else {
        errorMessage = String(apiError);
      }
      
      throw new Error(`Claude API error: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('Error in analyzeWebsiteWithAnthropic:', error);
    throw error;
  }
}
