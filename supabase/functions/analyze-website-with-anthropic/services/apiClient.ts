
/**
 * API client for Claude API interactions
 */
import { verifyAnthropicApiKey } from './keyValidation.ts';

// Constants for API configuration
const CLAUDE_API_VERSION = "2023-06-01"; // Current version as of May 2024
const DEFAULT_TIMEOUT_MS = 90000; // 90 seconds timeout

/**
 * Call Claude API to analyze website content
 * Using direct fetch approach with improved error handling
 */
export async function callClaudeAPI(
  websiteContent: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = 'claude-3-sonnet-20240229',
  temperature: number = 0.3,
  maxTokens: number = 4000
): Promise<string> {
  // First verify the API key before making any call
  if (!verifyAnthropicApiKey()) {
    throw new Error('Invalid or missing Anthropic API key. Please check your ANTHROPIC_API_KEY in Supabase secrets.');
  }
  
  console.log('Making API call to Claude with model:', model);
  
  try {
    // Log the request parameters for debugging
    console.log('Claude API request parameters:', {
      model: model,
      maxTokens: maxTokens,
      hasSystemPrompt: !!systemPrompt,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      apiKeyExists: !!Deno.env.get('ANTHROPIC_API_KEY'),
      apiKeyPrefix: Deno.env.get('ANTHROPIC_API_KEY')?.substring(0, 8) + '...'
    });
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort('Request timed out');
    }, DEFAULT_TIMEOUT_MS);
    
    try {
      // Use fetch directly instead of the SDK
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
          'anthropic-version': CLAUDE_API_VERSION
        },
        body: JSON.stringify({
          model: model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: temperature
        }),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Enhanced error handling
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('Claude API error:', errorText);
        } catch (textError) {
          console.error('Could not extract error text from response:', textError);
          errorText = 'Unknown error';
        }
        
        // Create a detailed error message with status code
        throw new Error(`Claude API HTTP error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Claude API call successful, received response');
      
      // Check if we got a valid response
      if (!data || !data.content || data.content.length === 0) {
        console.error('Claude response was empty or invalid', data);
        throw new Error('Claude API returned an empty response');
      }
      
      const responseText = data.content[0].text;
      console.log(`Claude response length: ${responseText.length} chars`);
      console.log(`Claude response sample: ${responseText.substring(0, 200)}...`);
      
      return responseText;
    } catch (fetchError) {
      // Clear the timeout if we're failing due to other reasons
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (apiError: any) {
    // Log detailed error information
    console.error('Claude API error details:', typeof apiError === 'object' ? JSON.stringify(apiError) : apiError);
    
    // Enhanced error handling with more specific error messages
    let errorMessage = 'Unknown Claude API error';
    
    if (apiError.name === 'AbortError') {
      errorMessage = `Claude API request timed out after ${DEFAULT_TIMEOUT_MS/1000} seconds`;
    } else if (typeof apiError === 'object' && apiError !== null) {
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
}
