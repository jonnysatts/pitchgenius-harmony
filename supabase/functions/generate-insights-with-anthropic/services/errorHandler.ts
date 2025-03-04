
import { corsHeaders } from '../utils/corsUtils.ts';

export const createErrorResponse = (error: any) => {
  console.error("Error in generate-insights-with-anthropic:", error);
  
  // Create a structured error response with detailed information
  let errorMessage = "Unknown error occurred";
  let statusCode = 500;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check for specific error types
    if (error.name === 'AbortError') {
      errorMessage = "Request timed out while waiting for Anthropic API";
      statusCode = 504; // Gateway Timeout
    } else if (error.message.includes('API key')) {
      errorMessage = "Anthropic API key error: The API key is invalid, missing, or has incorrect permissions";
      statusCode = 401; // Unauthorized
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = "Anthropic API rate limit exceeded. Please try again later.";
      statusCode = 429; // Too Many Requests
    }
  }
  
  // Create a fallback error response with CORS headers
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      insights: [],
      status: statusCode,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Enhanced document content validation
export const validateDocumentContent = (documentContents: any[]) => {
  // Check if there's any document content
  if (!documentContents || documentContents.length === 0) {
    return {
      valid: false,
      message: "No document content provided for analysis"
    };
  }

  // Check if the content is too small for meaningful analysis (less than 500 characters total)
  const totalContentLength = documentContents.reduce((acc, doc) => {
    return acc + (typeof doc.content === 'string' ? doc.content.length : 0);
  }, 0);

  if (totalContentLength < 500) {
    return {
      valid: false,
      message: "Document content is too short for meaningful analysis. Please provide more detailed documents."
    };
  }

  // Check if content might be too large for Claude's context window
  if (totalContentLength > 100000) {
    console.warn(`Document content is very large: ${totalContentLength} characters. This may exceed Claude's context window.`);
    // We'll continue but log a warning - the anthropicService will handle this
  }

  return {
    valid: true,
    message: "Content validation passed",
    contentLength: totalContentLength
  };
};

// Handle API response errors more effectively
export const handleApiResponseError = async (response: Response): Promise<string> => {
  try {
    const errorText = await response.text();
    let errorMessage = `Anthropic API error (${response.status})`;
    
    // Try to parse as JSON for more details
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) {
        errorMessage = `Anthropic API error: ${errorJson.error.type || errorJson.error.message || errorJson.error}`;
      }
    } catch {
      // If not JSON, use the text
      errorMessage += `: ${errorText}`;
    }
    
    // Log detailed error info
    console.error('Anthropic API error details:', {
      status: response.status,
      statusText: response.statusText,
      errorText
    });
    
    throw new Error(errorMessage);
  } catch (parseError) {
    throw new Error(`Anthropic API returned status ${response.status} but couldn't parse error details: ${parseError.message}`);
  }
};
