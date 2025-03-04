
import { corsHeaders } from '../utils/corsHandlers.ts';
import { verifyAnthropicApiKey } from './keyValidation.ts';
import { testClaudeAPIConfiguration } from './apiClient.ts';

/**
 * Handler for diagnostic/test requests to check API key and configuration
 */
export async function handleDiagnosticRequest(): Promise<Response> {
  try {
    console.log('Processing diagnostic request to check Claude API configuration');
    
    // Check API key access and format
    const keyVerification = await verifyAnthropicApiKey();
    
    // Check for Firecrawl API keys
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const firecrawlApiKeyAlt = Deno.env.get('FIRECRAWL_API_KPI');
    
    console.log('Firecrawl API key status:');
    console.log('- FIRECRAWL_API_KEY exists:', !!firecrawlApiKey);
    console.log('- FIRECRAWL_API_KPI exists:', !!firecrawlApiKeyAlt);
    
    // Test the API configuration
    const apiConfig = await testClaudeAPIConfiguration();
    
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      edgeFunctionWorking: true,
      apiKeyVerification: {
        keyExists: keyVerification.keyExists,
        keyValid: keyVerification.valid,
        keyPrefix: keyVerification.keyPrefix,
        message: keyVerification.message
      },
      firecrawlKeys: {
        firecrawlApiKeyExists: !!firecrawlApiKey,
        firecrawlApiKeyAltExists: !!firecrawlApiKeyAlt,
        firecrawlAvailable: !!(firecrawlApiKey || firecrawlApiKeyAlt)
      },
      apiConfiguration: apiConfig,
      environmentInfo: {
        denoVersion: Deno.version.deno,
        v8Version: Deno.version.v8,
        typescriptVersion: Deno.version.typescript
      }
    };
    
    return new Response(JSON.stringify(diagnosticResult), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in diagnostic handler:', error);
    
    return new Response(JSON.stringify({
      error: `Diagnostic check failed: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
      edgeFunctionWorking: true,
      errorDetails: String(error)
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
