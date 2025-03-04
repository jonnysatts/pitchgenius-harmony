
/**
 * Create a standard error response with CORS headers
 */
export function createErrorResponse(error: any, corsHeaders: any, status: number = 500, additionalData: any = {}): Response {
  console.error("Error in edge function:", error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const responseData = { 
    error: errorMessage, 
    ...additionalData 
  };
  
  return new Response(
    JSON.stringify(responseData),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status 
    }
  );
}

/**
 * Handle API response errors
 */
export async function handleApiResponseError(response: Response): Promise<string> {
  const errorText = await response.text();
  console.error("Anthropic API error:", response.status, errorText);
  throw new Error(`Anthropic API error: ${response.status}`);
}
