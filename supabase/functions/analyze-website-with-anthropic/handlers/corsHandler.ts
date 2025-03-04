
import { corsHeaders } from '../utils/corsHandlers.ts';

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest(): Response {
  return new Response(null, {
    headers: corsHeaders
  });
}
