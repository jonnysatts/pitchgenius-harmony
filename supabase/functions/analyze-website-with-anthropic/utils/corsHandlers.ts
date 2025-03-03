
/**
 * CORS headers for the Edge Function
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  // This is needed for browser preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  // For actual requests, return null to continue processing
  return null;
}
