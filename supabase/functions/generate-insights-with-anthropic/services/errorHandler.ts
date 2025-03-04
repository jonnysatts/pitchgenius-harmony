
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
  
  // Get a more descriptive error message
  const errorMessage = getErrorMessage(error);
  
  // Log the error details but return fallback insights to maintain application function
  return new Response(
    JSON.stringify({
      insights: fallbackInsights,
      error: errorMessage,
      usingFallbackData: true,
      fallbackReason: errorMessage,
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
 * Validate document content before processing
 */
export function validateDocumentContent(documents: any[]): { valid: boolean; message: string; contentLength?: number } {
  if (!documents || !Array.isArray(documents)) {
    return { valid: false, message: "No documents provided for analysis" };
  }

  if (documents.length === 0) {
    return { valid: false, message: "No documents provided for analysis" };
  }

  // Calculate total content length
  let totalContentLength = 0;
  let hasContent = false;

  for (const doc of documents) {
    if (doc.content && typeof doc.content === 'string') {
      totalContentLength += doc.content.length;
      if (doc.content.length > 100) { // Consider documents with meaningful content
        hasContent = true;
      }
    }
  }

  if (!hasContent) {
    return { 
      valid: false, 
      message: "Documents contain insufficient content for meaningful analysis",
      contentLength: totalContentLength
    };
  }

  // Content is valid
  return { 
    valid: true, 
    message: "Content validation passed",
    contentLength: totalContentLength
  };
}

/**
 * Extract a useful error message
 */
function getErrorMessage(error: any): string {
  // Handle different error types
  if (error instanceof Error) {
    // For standard Error objects
    return `Error: ${error.message}`;
  }
  
  if (typeof error === 'string') {
    // For string errors
    return error;
  }
  
  if (error && error.error) {
    // For objects with error property
    return error.error;
  }
  
  if (error && error.message) {
    // For objects with message property
    return error.message;
  }
  
  if (error && error.status) {
    // For HTTP-like errors with status codes
    return `API error: status ${error.status}`;
  }
  
  // Default fallback
  return 'Unknown error occurred during analysis. Check Claude API configuration.';
}
