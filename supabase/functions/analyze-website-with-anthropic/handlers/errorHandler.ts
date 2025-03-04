
import { corsHeaders } from '../utils/corsHandlers.ts';
import { createErrorResponse } from '../services/errorHandler.ts';

/**
 * Handle request parsing errors
 */
export function handleRequestParsingError(error: Error): Response {
  console.error('Error parsing request body:', error);
  return new Response(
    JSON.stringify({
      error: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Handle general server errors
 */
export function handleServerError(error: unknown): Response {
  console.error(`Error processing request:`, error);
  
  // Create a detailed error response
  const errorDetail = error instanceof Error ? {
    message: error.message,
    name: error.name,
    stack: error.stack,
  } : String(error);
  
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString(),
      detail: errorDetail
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
