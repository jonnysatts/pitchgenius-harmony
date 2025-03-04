
/**
 * Define CORS headers for browser requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}
