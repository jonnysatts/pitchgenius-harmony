
/**
 * CORS utility functions
 */

/**
 * Standard CORS headers for Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Generate a CORS preflight response
 */
export function createCorsPreflightResponse() {
  return new Response(null, {
    headers: corsHeaders
  });
}
