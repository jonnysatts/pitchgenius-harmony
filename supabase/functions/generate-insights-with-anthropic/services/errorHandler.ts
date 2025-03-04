
import { corsHeaders } from '../utils/corsUtils.ts';

export const createErrorResponse = (error: any) => {
  console.error("Error in generate-insights-with-anthropic:", error);
  
  // Create a fallback error response with CORS headers
  return new Response(
    JSON.stringify({ 
      error: error.message || "Unknown error occurred",
      insights: [] 
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Validate document content
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

  return {
    valid: true,
    message: "Content validation passed"
  };
};
