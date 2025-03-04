
/**
 * Error handling service for website analysis
 */
import { corsHeaders } from '../utils/corsHandlers.ts';
import { generateFallbackInsights } from '../utils/defaultContentGenerators.ts';

/**
 * Create a standard error response with CORS headers
 */
export function createErrorResponse(
  error: any, 
  status: number = 500, 
  clientName: string = '', 
  clientIndustry: string = '',
  websiteUrl: string = ''
): Response {
  console.error("Error in website analysis edge function:", error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Generate fallback insights when an error occurs
  const fallbackInsights = generateFallbackInsights(
    websiteUrl || "unknown", 
    clientName || "", 
    clientIndustry || "technology"
  );
  
  const responseData = { 
    error: errorMessage,
    data: fallbackInsights
  };
  
  return new Response(
    JSON.stringify(responseData),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 // Always return 200 with fallback data for better UX
    }
  );
}

/**
 * Handle API response errors
 */
export async function handleApiResponseError(response: Response): Promise<string> {
  const errorText = await response.text();
  console.error("Claude API error:", response.status, errorText);
  throw new Error(`Claude API error: ${response.status}`);
}
