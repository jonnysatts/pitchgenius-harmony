
/**
 * Service for interacting with Anthropic Claude API
 */
import { corsHeaders } from '../utils/corsUtils.ts';
import { handleApiResponseError } from './errorHandler.ts';
import { AnthropicApiOptions } from '../types/anthropicTypes.ts';

/**
 * Call the Anthropic Claude API with proper error handling
 */
export async function callAnthropicAPI(
  content: string, 
  systemPrompt: string, 
  options: AnthropicApiOptions = {}
): Promise<string> {
  const {
    model = 'claude-3-sonnet-20240229',
    temperature = 0.3,
    maxTokens = 4000
  } = options;

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    throw new Error('ANTHROPIC_API_KEY not found. Please add it to your Supabase secrets.');
  }
  
  try {
    console.log(`Calling Anthropic API with model: ${model}, content length: ${content.length} chars`);
    console.log(`System prompt length: ${systemPrompt.length} chars`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content }],
        system: systemPrompt,
        temperature
      })
    });
    
    if (!response.ok) {
      return await handleApiResponseError(response);
    }
    
    const data = await response.json();
    
    if (!data.content || data.content.length === 0 || !data.content[0].text) {
      console.error('Empty or invalid response from Anthropic API:', data);
      throw new Error('Received empty or invalid response from Anthropic API');
    }
    
    console.log('Successfully received response from Anthropic API');
    return data.content[0].text;
    
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    // Provide detailed error information
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
    console.error('ANTHROPIC_API_KEY not found in environment');
    return false;
  }
  
  // Basic validation: Claude API keys should start with "sk-ant-" and be reasonably long
  const isValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  
  if (!isValid) {
    console.error('ANTHROPIC_API_KEY format appears invalid');
  }
  
  return isValid;
}
