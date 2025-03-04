
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
  
  // Check minimum length requirement
  if (apiKey.length < 25) {
    console.error('ANTHROPIC_API_KEY appears to be too short to be valid');
    return false;
  }
  
  console.log('API key verification passed');
  return true;
}

/**
 * Log detailed information about API key status
 */
export function logApiKeyStatus(): void {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set in environment variables');
  } else {
    const masked = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`ANTHROPIC_API_KEY is set (${masked})`);
    
    if (!apiKey.startsWith('sk-ant-')) {
      console.error('WARNING: ANTHROPIC_API_KEY does not start with "sk-ant-" which is the expected prefix');
    }
  }
}
