
/**
 * Utilities for validating the Anthropic API key
 */

/**
 * Verify that the Anthropic API key is available and valid
 * @returns Object with validation result and message
 */
export async function verifyAnthropicApiKey(): Promise<{
  valid: boolean;
  message: string;
  keyExists: boolean;
  keyPrefix?: string;
  formatValid?: boolean;
}> {
  try {
    console.log('Verifying Anthropic API key...');
    
    // Check if the API key exists
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      
      // Check other possible key names (helpful for debugging)
      const potentialKeys = [
        'CLAUDE_API_KEY',
        'CLAUDE_KEY',
        'ANTHROPIC_KEY'
      ];
      
      let alternateKeyFound = false;
      for (const keyName of potentialKeys) {
        if (Deno.env.get(keyName)) {
          alternateKeyFound = true;
          console.log(`Note: Found key with alternate name: ${keyName}`);
          break;
        }
      }
      
      return {
        valid: false,
        message: alternateKeyFound
          ? 'ANTHROPIC_API_KEY not found, but found key with alternate name. Please rename to ANTHROPIC_API_KEY.'
          : 'ANTHROPIC_API_KEY not found in environment variables',
        keyExists: false
      };
    }
    
    // Validate key format (Claude API keys typically start with sk-ant-)
    const hasValidPrefix = apiKey.startsWith('sk-ant-');
    const keyPrefix = apiKey.substring(0, 8) + '...';
    
    if (!hasValidPrefix) {
      console.warn('API key does not have the expected format (should start with sk-ant-)');
      return {
        valid: false,
        message: 'API key found but does not have the expected format (should start with sk-ant-)',
        keyExists: true,
        keyPrefix,
        formatValid: false
      };
    }
    
    // For development, we'll accept the key if it exists and has valid format
    // In production, we could make a test request to the API to further validate
    console.log('API key validation successful');
    return {
      valid: true,
      message: 'API key validation successful',
      keyExists: true,
      keyPrefix,
      formatValid: true
    };
  } catch (error) {
    console.error('Error during API key validation:', error);
    return {
      valid: false,
      message: `Error accessing API key: ${error instanceof Error ? error.message : String(error)}`,
      keyExists: false
    };
  }
}

/**
 * Test function that returns detailed diagnostics about the Anthropic API key
 * This is useful for debugging API key issues
 */
export async function diagnoseApiKeyIssues(): Promise<{
  keyExists: boolean;
  keyValue?: string;
  keyPrefix?: string;
  formatValid?: boolean;
  allEnvVars?: string[];
  error?: string;
}> {
  try {
    // Get all environment variable names for debugging
    const envVars = Object.keys(Deno.env.toObject());
    
    // Check if the API key exists
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      return {
        keyExists: false,
        allEnvVars: envVars,
        error: 'ANTHROPIC_API_KEY not found in environment variables'
      };
    }
    
    // Return a safe version of the key for verification
    const safeKeyValue = apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4);
    const keyPrefix = apiKey.substring(0, 8) + '...';
    
    // Validate key format
    const formatValid = apiKey.startsWith('sk-ant-');
    
    return {
      keyExists: true,
      keyValue: safeKeyValue,
      keyPrefix,
      formatValid,
      allEnvVars: envVars
    };
  } catch (error) {
    return {
      keyExists: false,
      error: `Error diagnosing API key: ${error instanceof Error ? error.message : String(error)}`,
      allEnvVars: []
    };
  }
}
