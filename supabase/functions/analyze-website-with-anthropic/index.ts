
import { corsHeaders } from './utils/corsHandlers.ts';
import { handleAnalysisRequest, handleDiagnosticRequest } from './services/requestHandler.ts';

// Enable detailed logging
const DEBUG_MODE = true;

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // Get the request URL and path
  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();
  
  if (DEBUG_MODE) console.log(`Request received for path: ${path || 'root'}`);

  try {
    // Add diagnostic endpoint
    if (path === 'diagnose' || path === 'test') {
      if (DEBUG_MODE) console.log('Processing diagnostic request');
      return await handleDiagnosticRequest();
    }
    
    // Regular website analysis path
    if (DEBUG_MODE) console.log('Processing website analysis request');
    return await handleAnalysisRequest(req);
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
        path: path,
        detail: errorDetail,
        timestamp: new Date().toISOString()
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
