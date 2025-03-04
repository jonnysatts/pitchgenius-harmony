/**
 * API client for Claude API interactions
 */
import { verifyAnthropicApiKey } from './keyValidation.ts';

// Constants for API configuration
const CLAUDE_API_VERSION = Deno.env.get('CLAUDE_API_VERSION') || "2023-06-01"; // Default version as of May 2024
const DEFAULT_TIMEOUT_MS = parseInt(Deno.env.get('DEFAULT_TIMEOUT_MS') || "90000"); // 90 seconds timeout

/**
 * Call Claude API to analyze website content
 * Using direct fetch approach with improved error handling
 */
export async function callClaudeAPI(
  websiteContent: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = Deno.env.get('CLAUDE_MODEL') || 'claude-3-sonnet-20240229',
  temperature: number = parseFloat(Deno.env.get('CLAUDE_TEMPERATURE') || "0.3"),
  maxTokens: number = parseInt(Deno.env.get('CLAUDE_MAX_TOKENS') || "4000")
): Promise<string> {
  // First verify the API key before making any call
  const keyVerification = await verifyAnthropicApiKey();
  if (!keyVerification.valid) {
    throw new Error(`Invalid or missing Anthropic API key: ${keyVerification.message}`);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
  const apiKeyPrefix = apiKey.substring(0, 8) + '...';
  const apiKeyLooksValid = apiKey.startsWith('sk-ant-');

  // Log request details for debugging
  console.log('Claude API request parameters:', {
    model,
    maxTokens,
    systemPromptLength: systemPrompt.length,
    userPromptLength: userPrompt.length,
    apiKeyPrefix,
    apiKeyLooksValid,
    contentLength: websiteContent.length
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Request timed out'), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_API_VERSION
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleAPIError(response);
    }

    const data = await response.json();
    if (!data || !data.content || data.content.length === 0) {
      throw new Error('Claude API returned an empty response');
    }

    const responseText = data.content[0].text;
    return responseText;
  } catch (error) {
    clearTimeout(timeoutId);
    handleGlobalError(error);
  }
}

/**
 * Handle API errors and provide detailed messages
 */
async function handleAPIError(response: Response): Promise<void> {
  let errorText = '';
  try {
    const errorJson = await response.json();
    errorText = JSON.stringify(errorJson);
  } catch {
    errorText = await response.text();
  }

  const errorMessage = `Claude API HTTP error: ${response.status} - ${errorText}`;
  switch (response.status) {
    case 401:
      throw new Error(`${errorMessage} - Authentication failed. Check your API key.`);
    case 429:
      throw new Error(`${errorMessage} - Rate limit exceeded. Try again later.`);
    case 400:
      throw new Error(`${errorMessage} - Bad request.`);
    default:
      throw new Error(errorMessage);
  }
}

/**
 * Handle global errors and provide detailed messages
 */
function handleGlobalError(error: any): never {
  let errorMessage = 'Unknown Claude API error';
  if (error.name === 'AbortError') {
    errorMessage = `Claude API request timed out after ${DEFAULT_TIMEOUT_MS / 1000} seconds`;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = error.message || JSON.stringify(error);
  } else {
    errorMessage = String(error);
  }
  throw new Error(`Claude API error: ${errorMessage}`);
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
