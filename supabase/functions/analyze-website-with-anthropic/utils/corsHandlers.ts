
/**
 * CORS utilities for Edge Functions
 */

// CORS headers for Supabase Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  // Check if this is a preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No content
      headers: corsHeaders,
    });
  }
  
  // Not a preflight request
  return null;
}

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(): Response {
  return new Response(null, { 
    headers: corsHeaders,
    status: 204 
  });
}
