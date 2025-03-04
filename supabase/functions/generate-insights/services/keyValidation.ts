
/**
 * Verify the Anthropic API key
 */
export function verifyAnthropicApiKey(): boolean {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return false;
  }
  
  if (!apiKey.startsWith('sk-ant-')) {
    console.error('ANTHROPIC_API_KEY does not have the expected format (should start with sk-ant-)');
    return false;
  }
  
  console.log('API key verification passed');
  return true;
}
