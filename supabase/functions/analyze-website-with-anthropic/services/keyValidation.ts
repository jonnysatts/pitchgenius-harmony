
/**
 * Key validation service for Anthropic API
 */

/**
 * Verify if Anthropic API key exists and has the correct format
 */
export async function verifyAnthropicApiKey(): Promise<{
  valid: boolean;
  keyExists: boolean;
  formatValid: boolean;
  keyPrefix: string;
  message: string;
}> {
  console.log('Verifying Anthropic API key...');
  
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    return {
      valid: false,
      keyExists: false,
      formatValid: false,
      keyPrefix: '',
      message: 'ANTHROPIC_API_KEY not found in environment variables'
    };
  }
  
  // Claude API keys should start with "sk-ant-" and be reasonably long
  const isFormatValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  const keyPrefix = apiKey.substring(0, 8) + '...';
  
  console.log(`API key found. Format valid: ${isFormatValid}, prefix: ${keyPrefix}`);
  
  return {
    valid: isFormatValid,
    keyExists: true,
    formatValid: isFormatValid,
    keyPrefix,
    message: isFormatValid 
      ? 'API key is valid and has the expected format' 
      : 'API key has invalid format (should start with sk-ant-)'
  };
}
