
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
  let errorType: string = 'unknown_error';
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetail = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
    
    // Determine error type from error message
    if (error.message.includes('rate limit') || error.message.includes('timeout') || 
        error.message.includes('overloaded')) {
      errorType = 'rate_limit_error';
    } else if (error.message.includes('API key')) {
      errorType = 'api_key_error';
    } else if (error.message.includes('insufficient') || error.message.includes('content too short')) {
      errorType = 'insufficient_content_error';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network_error';
    } else if (error.name === 'AbortError') {
      errorType = 'timeout_error';
    }
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = JSON.stringify(error);
    errorDetail = error;
    
    // Check for specific error type in object
    const errorObj = error as any;
    if (errorObj.type) {
      errorType = errorObj.type;
    }
  } else {
    errorMessage = String(error);
  }
  
  const responseData = {
    error: errorMessage,
    errorType,
    insufficientContent: errorType === 'insufficient_content_error',
    usingFallback: true,
    insights: fallbackInsights,
    errorDetail,
    timestamp: new Date().toISOString(),
    success: false,
    retriableError: errorType === 'rate_limit_error' || 
                   errorType === 'timeout_error' || 
                   errorType === 'network_error'
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
