
/**
 * Error handling service for Anthropic API integration
 */
import { corsHeaders } from '../utils/corsUtils.ts';
import { generateFallbackInsights } from './responseParser.ts';

/**
 * Create a standard error response with fallback insights
 */
export function createErrorResponse(error: any, status: number = 200): Response {
  console.error("Error in generate-insights-with-anthropic:", error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Generate fallback insights when an error occurs
  const fallbackInsights = generateFallbackInsights();
  
  return new Response(
    JSON.stringify({
      error: errorMessage,
      insights: fallbackInsights,
      insufficientContent: false
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 // Always return 200 with fallback data
    }
  );
}

/**
 * Handle API response errors with detailed logging
 */
export async function handleApiResponseError(response: Response): Promise<string> {
  let errorText = '';
  
  try {
    errorText = await response.text();
  } catch (error) {
    errorText = 'Could not extract error text from response';
  }
  
  console.error("Claude API error:", response.status, errorText);
  throw new Error(`Claude API error: ${response.status} - ${errorText}`);
}

/**
 * Validate document content before processing
 */
export function validateDocumentContent(documents: any[]): { valid: boolean; message?: string } {
  if (!documents || documents.length === 0) {
    return { 
      valid: false, 
      message: 'No document content provided for analysis' 
    };
  }
  
  // Check for minimum viable content
  const totalContentLength = documents.reduce((sum, doc) => {
    return sum + (typeof doc.content === 'string' ? doc.content.length : 0);
  }, 0);
  
  if (totalContentLength < 100) {
    return { 
      valid: false, 
      message: 'Insufficient document content for analysis (less than 100 characters total)' 
    };
  }
  
  return { valid: true };
}
