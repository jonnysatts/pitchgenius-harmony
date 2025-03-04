
/**
 * Error handling services for Claude API
 */
import { corsHeaders } from '../utils/corsUtils.ts';

/**
 * Validate document content before processing
 */
export function validateDocumentContent(documentContents: any[]): {
  valid: boolean;
  message: string;
  contentLength?: number;
} {
  // Check if we have any documents
  if (!documentContents || !Array.isArray(documentContents) || documentContents.length === 0) {
    return {
      valid: false,
      message: "No document contents provided for analysis"
    };
  }
  
  // Calculate total content length
  let totalContentLength = 0;
  let nonEmptyDocuments = 0;
  
  for (const doc of documentContents) {
    if (doc.content && typeof doc.content === 'string') {
      totalContentLength += doc.content.length;
      if (doc.content.length > 100) {
        nonEmptyDocuments++;
      }
    }
  }
  
  // Check if we have enough content to analyze
  if (totalContentLength < 500) {
    return {
      valid: false,
      message: "Insufficient document content for meaningful analysis",
      contentLength: totalContentLength
    };
  }
  
  // Check if we have at least one non-empty document
  if (nonEmptyDocuments === 0) {
    return {
      valid: false,
      message: "No documents with sufficient content found",
      contentLength: totalContentLength
    };
  }
  
  return {
    valid: true,
    message: "Document content validation successful",
    contentLength: totalContentLength
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, statusCode: number = 500): Response {
  console.error('Creating error response:', error);
  
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
    insights: [],
    errorDetail,
    timestamp: new Date().toISOString()
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

/**
 * Handle API response errors
 */
export async function handleApiResponseError(response: Response): Promise<never> {
  const statusCode = response.status;
  
  let errorBody = '';
  let errorJson = null;
  
  try {
    // Try to parse as JSON first
    const bodyText = await response.text();
    errorBody = bodyText;
    
    try {
      errorJson = JSON.parse(bodyText);
      console.error('API error response JSON:', errorJson);
    } catch {
      // Not JSON, just use as text
      console.error('API error response text:', bodyText);
    }
  } catch (e) {
    errorBody = 'Could not read error response body';
    console.error('Could not read error response body:', e);
  }
  
  // Log detailed information about the error
  console.error('API error details:', {
    status: statusCode,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: errorBody.substring(0, 1000), // Log first 1000 chars
    isJson: !!errorJson
  });
  
  // Create more specific error messages based on status code
  let errorMessage = `API request failed with status ${statusCode}`;
  
  if (statusCode === 401) {
    errorMessage = 'Authentication failed - check your API key';
  } else if (statusCode === 403) {
    errorMessage = 'Authorization failed - your API key does not have permission';
  } else if (statusCode === 429) {
    errorMessage = 'Rate limit exceeded - please try again later';
  } else if (statusCode >= 500) {
    errorMessage = 'Server error - please try again later';
  }
  
  // Add JSON error details if available
  if (errorJson && errorJson.error) {
    const jsonErrorDetail = typeof errorJson.error === 'object' 
      ? errorJson.error.message || JSON.stringify(errorJson.error)
      : errorJson.error;
    
    errorMessage += `. Details: ${jsonErrorDetail}`;
  }
  
  throw new Error(errorMessage);
}
