
/**
 * Error handling service for the website analysis function
 */
import { corsHeaders } from '../utils/corsHandlers.ts';
import { generateFallbackInsights } from './fallbackGenerator.ts';

/**
 * Create an error response with proper structure
 */
export function createErrorResponse(
  error: unknown, 
  statusCode: number = 500,
  clientIndustry: string = 'technology'
): Response {
  console.error('Creating error response:', error);
  
  // Generate fallback insights for the error response
  const fallbackInsights = generateFallbackInsights(clientIndustry).map(insight => ({
    ...insight,
    source: 'website'  // Explicitly mark these as website insights
  }));
  
  let errorMessage: string;
  let errorDetail: any = {};
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetail = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = JSON.stringify(error);
    errorDetail = error;
  } else {
    errorMessage = String(error);
  }
  
  const responseData = {
    error: errorMessage,
    insufficientContent: false,
    usingFallback: true,
    insights: fallbackInsights,
    errorDetail,
    timestamp: new Date().toISOString(),
    success: false,
    retriableError: errorMessage.includes('rate limit') || 
                   errorMessage.includes('timeout') || 
                   errorMessage.includes('overloaded')
  };
  
  return new Response(
    JSON.stringify(responseData),
    {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
