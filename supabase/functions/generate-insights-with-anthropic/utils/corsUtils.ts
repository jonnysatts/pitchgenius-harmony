
/**
 * Utilities for handling CORS in Supabase Edge Functions
 */

// Define standard CORS headers to be used across all functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(): Response {
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}

/**
 * Add CORS headers to an existing headers object
 */
export function addCorsHeaders(headers: Headers): Headers {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return headers;
}

/**
 * Create a Response with CORS headers
 */
export function createCorsResponse(
  body: any, 
  options: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const { status = 200, headers = {} } = options;
  
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...headers 
      }
    }
  );
}
