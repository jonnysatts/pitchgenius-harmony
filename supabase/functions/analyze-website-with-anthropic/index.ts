
import { corsHeaders } from './utils/corsHandlers.ts';
import { handleAnalysisRequest, handleDiagnosticRequest } from './services/requestHandler.ts';
import { createErrorResponse } from './services/errorHandler.ts';
import { handleTestModeRequest } from './services/testModeHandler.ts';

// Enable detailed logging
const DEBUG_MODE = true;

// Handle requests
Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Get the request URL and path
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    if (DEBUG_MODE) console.log(`Request received for path: ${path || 'root'}, method: ${req.method}`);

    // Add diagnostic endpoint
    if (path === 'diagnose' || path === 'test') {
      if (DEBUG_MODE) console.log('Processing diagnostic request');
      return await handleDiagnosticRequest();
    }
    
    // Parse the request body first to check for test_mode
    let requestData;
    try {
      requestData = await req.json();
      if (DEBUG_MODE) console.log('Request body parsed successfully');
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Handle test mode
    if (requestData.test_mode === true) {
      if (DEBUG_MODE) console.log('Test mode detected in index.ts, handling test request');
      return await handleTestModeRequest(requestData);
    }
    
    // Regular website analysis path
    if (DEBUG_MODE) console.log('Processing website analysis request');
    
    try {
      // Create a new request with the same body for handleAnalysisRequest
      const newReq = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(requestData)
      });
      
      return await handleAnalysisRequest(newReq);
    } catch (analysisError) {
      console.error('Error during analysis:', analysisError);
      return createErrorResponse(analysisError, 500, requestData.client_industry || "technology");
    }
  } catch (error) {
    console.error(`Error processing request:`, error);
    
    // Create a detailed error response
    const errorDetail = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
    } : String(error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
        detail: errorDetail
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
