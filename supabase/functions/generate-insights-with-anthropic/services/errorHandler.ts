
/**
 * Error handling utilities for Claude API integration
 */
import { corsHeaders } from '../utils/corsUtils.ts';
import { generateFallbackInsights } from '../utils/fallbackGenerator.ts';

/**
 * Create an error response that follows the API contract
 */
export function createErrorResponse(
  error: any,
  status: number = 500,
  clientIndustry: string = 'technology',
  documentCount: number = 5
): Response {
  console.error('Creating error response:', error);
  
  // Generate fallback insights when Claude API fails
  const fallbackInsights = generateFallbackInsights(clientIndustry, documentCount);
  
  // Log the error but return fallback insights to maintain application function
  return new Response(
    JSON.stringify({
      insights: fallbackInsights,
      error: getErrorMessage(error),
      usingFallbackData: true,
      fallbackReason: getErrorMessage(error),
      processingTime: 0
    }),
    {
      status: 200, // Return 200 even for errors so client gets fallback data
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Extract a useful error message
 */
function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.error) {
    return error.error;
  }
  
  return 'Unknown error occurred during analysis';
}
