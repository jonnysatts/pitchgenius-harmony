
/**
 * Utilities for API key validation
 */

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
