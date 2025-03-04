
/**
 * Error handling utilities for Edge Functions
 */
import { corsHeaders } from '../utils/corsUtils.ts';

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: unknown, status = 500): Response {
  console.error('❌ Error in Edge Function:', error);
  
  let errorMessage = 'Unknown error processing insights';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      insights: [] 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Validates document content to ensure it's sufficient for analysis
 */
export function validateDocumentContent(documentContents: any[]): { 
  valid: boolean; 
  message?: string;
  contentLength?: number;
} {
  // Check if documentContents is defined and not empty
  if (!documentContents || documentContents.length === 0) {
    return { 
      valid: false, 
      message: 'No documents provided for analysis' 
    };
  }
  
  // Calculate total content length across all documents
  let totalContentLength = 0;
  let invalidContentCount = 0;
  
  for (const doc of documentContents) {
    // Check if content exists and is not a blob URL or placeholder
    if (!doc.content) {
      invalidContentCount++;
      continue;
    }
    
    // Check if content is a blob URL or just a reference
    if (doc.content.startsWith('blob:') || 
        doc.content.startsWith('Content from URL:') ||
        doc.content.length < 20) {
      invalidContentCount++;
      continue;
    }
    
    totalContentLength += doc.content.length;
  }
  
  // If all documents have invalid content
  if (invalidContentCount === documentContents.length) {
    return {
      valid: false,
      message: 'All documents contain invalid or inaccessible content. Please check document extraction process.',
      contentLength: totalContentLength
    };
  }
  
  // Check if total content is below the minimum threshold
  if (totalContentLength < 200) {
    return {
      valid: false,
      message: 'Insufficient document content for meaningful analysis. Total content too short.',
      contentLength: totalContentLength
    };
  }
  
  return { 
    valid: true,
    contentLength: totalContentLength
  };
}

/**
 * Handles API response errors
 */
export function handleApiResponseError(response: Response): Promise<never> {
  return response.text().then(text => {
    let message = `API returned status ${response.status}`;
    try {
      // Try to parse the error as JSON
      const data = JSON.parse(text);
      if (data.error) {
        message += `: ${data.error}`;
      }
    } catch {
      // If not JSON, use the raw text
      if (text) {
        message += `: ${text}`;
      }
    }
    throw new Error(message);
  });
}
