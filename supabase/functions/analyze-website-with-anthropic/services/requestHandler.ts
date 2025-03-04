
import { corsHeaders } from '../utils/corsHandlers.ts';
import { verifyAnthropicApiKey } from './keyValidation.ts';
import { createErrorResponse } from './errorHandler.ts';
import { handleDiagnosticRequest } from './diagnosticHandler.ts';
import { handleTestModeRequest } from './testModeHandler.ts';
import { processWebsiteContent } from './contentProcessor.ts';

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
      return await handleTestModeRequest(requestData);
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
      // Process the website content and analyze it
      return await processWebsiteContent(
        website_url,
        system_prompt,
        client_name,
        client_industry,
        use_firecrawl
      );
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

// Export the diagnostic request handler
export { handleDiagnosticRequest };
