import { corsHeaders } from '../utils/corsHandlers.ts';
import { analyzeWebsiteWithAnthropic } from './anthropicService.ts';
import { extractWebsiteContent } from './websiteContentService.ts';
import { verifyAnthropicApiKey } from './keyValidation.ts';
import { testClaudeAPIConfiguration } from './apiClient.ts';
import { createErrorResponse } from './errorHandler.ts';
import { generateFallbackInsights } from './fallbackGenerator.ts';

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
      use_firecrawl = true,
      test_mode = false
    } = requestData;

    console.log(`Processing analysis request for website: ${website_url}`);
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    // Test mode for diagnostics
    if (test_mode === true) {
      console.log('Test mode detected, returning mock response');
      
      const mockResponse = {
        success: true,
        test_mode: true,
        message: "Website analysis test connection successful",
        insights: generateFallbackInsights(client_industry),
        website_url: website_url || "test.com",
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
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
    
    try {
      // Extract website content using the appropriate service
      console.log(`Attempting to extract content from website: ${website_url}`);
      const websiteContent = await extractWebsiteContent(website_url, use_firecrawl);
      
      if (!websiteContent || websiteContent.length < 100) {
        console.warn(`Insufficient content extracted: ${websiteContent.length} characters`);
        return createErrorResponse({
          error: `Failed to extract sufficient content from website: ${website_url}`,
          insufficientContent: true,
          suggestDiagnostics: true
        }, 400, client_industry);
      }
      
      console.log(`Successfully extracted ${websiteContent.length} characters from website`);
      
      // Analyze the website with Claude
      console.log('Sending content to Claude API for analysis');
      const result = await analyzeWebsiteWithAnthropic(
        websiteContent,
        system_prompt, 
        client_name,
        client_industry
      );
      
      console.log('Claude analysis completed successfully');
      return new Response(result, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (extractionError) {
      console.error('Error during content extraction or analysis:', extractionError);
      return createErrorResponse({
        error: `${extractionError instanceof Error ? extractionError.message : String(extractionError)}`,
        suggestDiagnostics: true
      }, 500, client_industry);
    }
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
