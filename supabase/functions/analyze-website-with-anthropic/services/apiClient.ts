
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
  const keyVerification = await verifyAnthropicApiKey();
  if (!keyVerification.valid) {
    console.error(`API key verification failed: ${keyVerification.message}`);
    throw new Error(`Invalid or missing Anthropic API key: ${keyVerification.message}`);
  }
  
  console.log('Making API call to Claude with model:', model);
  
  try {
    // Get the API key for logging (first few chars only)
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
    const apiKeyPrefix = apiKey.substring(0, 8) + '...';
    const apiKeyLooksValid = apiKey.startsWith('sk-ant-');
    
    // Log more request details for debugging
    console.log('Claude API request parameters:', {
      model: model,
      maxTokens: maxTokens,
      hasSystemPrompt: !!systemPrompt,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      apiKeyExists: !!apiKey,
      apiKeyPrefix: apiKeyPrefix,
      apiKeyLooksValid: apiKeyLooksValid,
      contentLength: websiteContent.length
    });
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort('Request timed out');
    }, DEFAULT_TIMEOUT_MS);
    
    try {
      console.log('Preparing to send request to Claude API...');
      
      // Use fetch directly instead of the SDK
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
      
      console.log(`Claude API response status: ${response.status}`);
      
      // Enhanced error handling
      if (!response.ok) {
        let errorText = '';
        let errorJson = null;
        
        try {
          // Try to parse error as JSON first
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
          console.error('Claude API error:', errorJson);
        } catch (jsonError) {
          // If not JSON, get as text
          try {
            errorText = await response.text();
            console.error('Claude API error text:', errorText);
          } catch (textError) {
            console.error('Could not extract error from response:', textError);
            errorText = 'Unknown error';
          }
        }
        
        // Create a detailed error message with status code
        const errorMessage = `Claude API HTTP error: ${response.status}`;
        console.error(errorMessage, errorJson || errorText);
        
        // Add specific handling for different status codes
        if (response.status === 401) {
          throw new Error(`${errorMessage} - Authentication failed. Check your API key.`);
        } else if (response.status === 429) {
          throw new Error(`${errorMessage} - Rate limit exceeded. Try again later.`);
        } else if (response.status === 400) {
          throw new Error(`${errorMessage} - Bad request: ${errorText}`);
        } else {
          throw new Error(`${errorMessage} - ${errorText}`);
        }
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

/**
 * Test API configuration without making a full request
 * This function tests if we can access the API key and if it's in the expected format
 */
export async function testClaudeAPIConfiguration(): Promise<{
  success: boolean;
  message: string;
  apiKeyExists: boolean;
  apiKeyFormat: boolean;
  apiKeyPrefix?: string;
}> {
  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        message: 'ANTHROPIC_API_KEY not found in environment variables',
        apiKeyExists: false,
        apiKeyFormat: false
      };
    }
    
    // Check if the API key is in the expected format (Claude API keys start with sk-ant-)
    const hasValidPrefix = apiKey.startsWith('sk-ant-');
    const keyPrefix = apiKey.substring(0, 8) + '...';
    
    return {
      success: true,
      message: hasValidPrefix 
        ? 'API key found and has the expected format' 
        : 'API key found but does not have the expected format (should start with sk-ant-)',
      apiKeyExists: true,
      apiKeyFormat: hasValidPrefix,
      apiKeyPrefix: keyPrefix
    };
  } catch (error) {
    return {
      success: false,
      message: `Error accessing API key configuration: ${error instanceof Error ? error.message : String(error)}`,
      apiKeyExists: false,
      apiKeyFormat: false
    };
  }
}
