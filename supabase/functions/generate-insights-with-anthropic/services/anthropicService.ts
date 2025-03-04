
/**
 * Service for interacting with Anthropic Claude API
 */
import { corsHeaders } from '../utils/corsUtils.ts';
import { handleApiResponseError } from './errorHandler.ts';
import { AnthropicApiOptions } from '../types/anthropicTypes.ts';

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

// Constants
const CLAUDE_API_VERSION = "2023-06-01"; // Current version as of May 2024
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_TIMEOUT_MS = 90000; // 90 seconds timeout

/**
 * Call the Anthropic Claude API with proper error handling
 */
export async function callAnthropicAPI(
  content: string, 
  systemPrompt: string, 
  options: AnthropicApiOptions = {}
): Promise<string> {
  const {
    model = 'claude-3-opus-20240229', // Updated model name
    temperature = 0.3,
    maxTokens = 4000,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = options;

  // Get API key from environment with detailed logging
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (DEBUG_MODE) console.log('🔑 Checking for ANTHROPIC_API_KEY availability');
  
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    throw new Error('ANTHROPIC_API_KEY not found. Please add it to your Supabase secrets with exactly this name.');
  }
  
  // Verify key format with detailed logging
  if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    if (DEBUG_MODE) {
      console.error('❌ ANTHROPIC_API_KEY has invalid format:',
        ANTHROPIC_API_KEY.substring(0, 7) + '...',
        'Length:', ANTHROPIC_API_KEY.length);
    } else {
      console.error('❌ ANTHROPIC_API_KEY has invalid format');
    }
    throw new Error('ANTHROPIC_API_KEY has invalid format. API keys should start with "sk-ant-".');
  }
  
  if (DEBUG_MODE) {
    console.log(`✅ API key validated successfully: ${ANTHROPIC_API_KEY.substring(0, 7)}... (${ANTHROPIC_API_KEY.length} chars)`);
  }
  
  try {
    if (DEBUG_MODE) {
      console.log(`🔄 Calling Anthropic API with model: ${model}, content length: ${content.length} chars`);
      console.log(`📝 System prompt length: ${systemPrompt.length} chars`);
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (DEBUG_MODE) console.log('⏱️ Request timeout reached, aborting');
      controller.abort('Request timed out');
    }, timeoutMs);
    
    // Log request structure for debugging
    const requestBody = {
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content }],
      system: systemPrompt,
      temperature
    };
    
    if (DEBUG_MODE) {
      console.log('📡 Request structure:', JSON.stringify({
        model: requestBody.model,
        max_tokens: requestBody.max_tokens,
        system_length: requestBody.system.length,
        message_count: requestBody.messages.length,
        first_message_length: requestBody.messages[0].content.length
      }));
    }
    
    try {
      if (DEBUG_MODE) console.log('📡 Sending request to Anthropic API endpoint:', CLAUDE_API_URL);
      
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': CLAUDE_API_VERSION
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Log the response status and headers for debugging
      if (DEBUG_MODE) {
        console.log(`📡 Claude API response status: ${response.status}`);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      if (!response.ok) {
        // Attempt to get more detailed error information
        let errorDetails = '';
        try {
          const errorBody = await response.text();
          errorDetails = errorBody;
          console.error('❌ Claude API error response:', errorBody);
        } catch (readError) {
          console.error('❌ Could not read error response:', readError);
        }
        
        throw new Error(`Claude API returned ${response.status}: ${errorDetails}`);
      }
      
      const data = await response.json();
      if (DEBUG_MODE) console.log('✅ Successfully received response from Anthropic API');
      
      // Validate response structure
      if (!data.content || data.content.length === 0 || !data.content[0].text) {
        console.error('❌ Empty or invalid response from Anthropic API:', data);
        throw new Error('Received empty or invalid response from Anthropic API');
      }
      
      const responseText = data.content[0].text;
      if (DEBUG_MODE) {
        console.log(`📄 Claude response length: ${responseText.length} chars`);
        console.log(`📄 Claude response sample: ${responseText.substring(0, 200)}...`);
      }
      
      return responseText;
    } catch (fetchError) {
      // Clear the timeout if we're failing due to other reasons
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error calling Anthropic API:', error);
    
    // Provide detailed error information
    if (error.name === 'AbortError') {
      throw new Error(`Anthropic API request timed out after ${timeoutMs/1000} seconds`);
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error calling Anthropic API';
      
    throw new Error(`Anthropic API error: ${errorMessage}`);
  }
}

/**
 * Verify if the Anthropic API key is valid
 */
export function verifyAnthropicApiKey(): boolean {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    return false;
  }
  
  // More thorough validation: Claude API keys should start with "sk-ant-" and be reasonably long
  const isValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  
  if (!isValid) {
    console.error('❌ ANTHROPIC_API_KEY format appears invalid');
  }
  
  return isValid;
}
