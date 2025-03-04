
/**
 * Client for calling the Claude API
 */
import { verifyAnthropicApiKey } from './keyValidation.ts';

/**
 * Make a direct API call to Claude
 */
export async function callClaudeAPI(
  systemPrompt: string,
  userContent: string,
  model: string = 'claude-3-sonnet-20240229',
  temperature: number = 0.2,
  maxTokens: number = 4000
): Promise<any> {
  if (!verifyAnthropicApiKey()) {
    throw new Error('Invalid or missing Anthropic API key. Please check your ANTHROPIC_API_KEY in Supabase secrets.');
  }
  
  try {
    console.log('Making direct API call to Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userContent
          }
        ],
        temperature: temperature
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API HTTP error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}
