
import { corsHeaders } from '../utils/corsHandlers.ts';
import { analyzeWebsiteWithAnthropic } from './anthropicService.ts';
import { extractWebsiteContent } from './websiteContentService.ts';
import { verifyAnthropicApiKey } from './keyValidation.ts';
import { testClaudeAPIConfiguration } from './apiClient.ts';
import { createErrorResponse } from './errorHandler.ts';

/**
 * Main handler for website analysis requests
 */
export async function handleAnalysisRequest(req: Request): Promise<Response> {
  try {
    // Parse the request body
    const requestData = await req.json();
    const {
      website_url,
      client_name = "",
      client_industry = "technology",
      system_prompt = "",
      use_firecrawl = true
    } = requestData;

    console.log(`Processing analysis request for website: ${website_url}`);
    
    // Verify the API key before proceeding
    const keyVerification = await verifyAnthropicApiKey();
    if (!keyVerification.valid) {
      console.error(`API key verification failed: ${keyVerification.message}`);
      
      const errorDetails = {
        apiKeyStatus: {
          checked: true,
          exists: keyVerification.keyExists,
          validFormat: keyVerification.formatValid,
          keyPrefix: keyVerification.keyPrefix
        },
        error: keyVerification.message,
        message: "Please run diagnostics tests to identify the issue",
        suggestDiagnostics: true
      };
      
      return createErrorResponse(errorDetails, 400, client_industry);
    }
    
    // Validate the website URL
    if (!website_url) {
      return createErrorResponse({
        error: "No website URL provided",
        suggestDiagnostics: true
      }, 400, client_industry);
    }
    
    // Extract website content using the appropriate service
    const websiteContent = await extractWebsiteContent(website_url, use_firecrawl);
    
    if (!websiteContent || websiteContent.length < 100) {
      return createErrorResponse({
        error: `Failed to extract sufficient content from website: ${website_url}`,
        suggestDiagnostics: true
      }, 400, client_industry);
    }
    
    // Analyze the website with Claude
    const result = await analyzeWebsiteWithAnthropic(
      websiteContent,
      system_prompt, 
      client_name,
      client_industry
    );
    
    return new Response(result, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in request handler:', error);
    return createErrorResponse({
      error: error instanceof Error ? error.message : String(error),
      suggestDiagnostics: true
    }, 500, "technology");
  }
}

/**
 * Handler for diagnostic/test requests to check API key and configuration
 */
export async function handleDiagnosticRequest(): Promise<Response> {
  try {
    console.log('Processing diagnostic request to check Claude API configuration');
    
    // Check API key access and format
    const keyVerification = await verifyAnthropicApiKey();
    
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
