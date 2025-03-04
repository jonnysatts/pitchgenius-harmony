
import { handleAnalysisRequest, handleDiagnosticRequest } from '../services/requestHandler.ts';
import { handleTestModeRequest } from '../services/testModeHandler.ts';
import { handleCorsRequest } from './corsHandler.ts';
import { handleRequestParsingError, handleServerError } from './errorHandler.ts';

// Debug mode flag
const DEBUG_MODE = true;

/**
 * Main request handler for the Edge Function
 */
export async function handleRequest(req: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return handleCorsRequest();
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
      return handleRequestParsingError(e);
    }
    
    // Handle test mode
    if (requestData.test_mode === true) {
      if (DEBUG_MODE) console.log('Test mode detected in mainHandler, handling test request');
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
      return handleServerError(analysisError);
    }
  } catch (error) {
    return handleServerError(error);
  }
}
