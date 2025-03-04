
import { corsHeaders } from './utils/corsHandlers.ts';
import { handleAnalysisRequest, handleDiagnosticRequest } from './services/requestHandler.ts';

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
  
  console.log(`Request received for path: ${path}`);

  try {
    // Add diagnostic endpoint
    if (path === 'diagnose' || path === 'test') {
      return await handleDiagnosticRequest();
    }
    
    // Regular website analysis path
    return await handleAnalysisRequest(req);
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error',
        path: path
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
