
import { toast } from "sonner";

// Error types to categorize different errors
export enum ErrorType {
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  ANALYSIS_ERROR = "ANALYSIS_ERROR",
  CLAUDE_API_ERROR = "CLAUDE_API_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

// Structure for error details
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  originalError?: any;
  retriable: boolean;
  context?: Record<string, any>;
}

/**
 * Centralized error handling service
 */
class ErrorService {
  // Log and format error for display/reporting
  handleError(error: unknown, context?: Record<string, any>): ErrorDetails {
    // Determine error type and create structured error details
    const errorDetails = this.createErrorDetails(error, context);
    
    // Log the error for debugging
    this.logError(errorDetails);
    
    // Show user-friendly notification if needed
    this.notifyUser(errorDetails);
    
    return errorDetails;
  }
  
  // Create standardized error details object
  private createErrorDetails(error: unknown, context?: Record<string, any>): ErrorDetails {
    // Default error details
    const details: ErrorDetails = {
      type: ErrorType.UNKNOWN_ERROR,
      message: "An unexpected error occurred",
      retriable: false,
      context
    };
    
    // Error is an Error object
    if (error instanceof Error) {
      details.message = error.message;
      details.originalError = error;
      
      // Parse error message to determine type
      if (error.message.includes("network") || error.message.includes("fetch")) {
        details.type = ErrorType.NETWORK_ERROR;
        details.retriable = true;
      } else if (error.message.includes("authentication") || error.message.includes("auth") || 
                error.message.includes("token") || error.message.includes("permission")) {
        details.type = ErrorType.AUTH_ERROR;
        details.retriable = false;
      } else if (error.message.includes("Claude") || error.message.includes("AI") || 
                error.message.includes("Anthropic")) {
        details.type = ErrorType.CLAUDE_API_ERROR;
        details.retriable = error.message.includes("rate limit") || 
                          error.message.includes("overloaded") ||
                          error.message.includes("timeout");
      } else if (error.message.includes("validation") || error.message.includes("invalid")) {
        details.type = ErrorType.VALIDATION_ERROR;
        details.retriable = false;
      } else if (error.message.includes("analysis") || error.message.includes("insight")) {
        details.type = ErrorType.ANALYSIS_ERROR;
        details.retriable = !error.message.includes("insufficient content");
      }
    } 
    // Error is a string
    else if (typeof error === "string") {
      details.message = error;
      
      // Simple string categorization
      if (error.includes("API") || error.includes("response")) {
        details.type = ErrorType.API_ERROR;
        details.retriable = true;
      }
    } 
    // Error is an object with specific structure
    else if (error && typeof error === "object") {
      const errorObj = error as any;
      details.message = errorObj.message || errorObj.error || JSON.stringify(error);
      details.originalError = error;
      
      // Check for api error
      if (errorObj.status || errorObj.statusCode) {
        details.type = ErrorType.API_ERROR;
        details.retriable = [408, 429, 500, 502, 503, 504].includes(errorObj.status || errorObj.statusCode);
      }
    }
    
    return details;
  }
  
  // Log error to console and potentially to monitoring service
  private logError(errorDetails: ErrorDetails): void {
    console.error("Error handled by ErrorService:", {
      type: errorDetails.type,
      message: errorDetails.message,
      context: errorDetails.context,
      originalError: errorDetails.originalError,
      timestamp: new Date().toISOString()
    });
    
    // In the future, this could send errors to a monitoring service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   captureException(errorDetails);
    // }
  }
  
  // Show user-friendly notifications
  private notifyUser(errorDetails: ErrorDetails): void {
    // Skip notifications for validation errors which should be handled at component level
    if (errorDetails.type === ErrorType.VALIDATION_ERROR) {
      return;
    }
    
    // Map error types to user-friendly messages
    let title: string;
    let description: string;
    
    switch (errorDetails.type) {
      case ErrorType.NETWORK_ERROR:
        title = "Network Error";
        description = "Please check your internet connection and try again.";
        break;
      case ErrorType.AUTH_ERROR:
        title = "Authentication Error";
        description = "Please sign in again to continue.";
        break;
      case ErrorType.CLAUDE_API_ERROR:
        title = "AI Analysis Error";
        description = errorDetails.retriable
          ? "Claude AI is currently busy. Please try again in a few moments."
          : "There was a problem with the AI analysis. Please check your content and try again.";
        break;
      case ErrorType.API_ERROR:
        title = "Service Error";
        description = errorDetails.retriable
          ? "Our service is experiencing high demand. Please try again shortly."
          : "We encountered an issue processing your request.";
        break;
      case ErrorType.ANALYSIS_ERROR:
        title = "Analysis Error";
        description = "We couldn't analyze your content. Please check your documents and try again.";
        break;
      default:
        title = "Unexpected Error";
        description = "Something went wrong. Please try again or contact support if the issue persists.";
    }
    
    // Show toast notification
    toast.error(title, {
      description,
      duration: 5000
    });
  }
  
  // Method to create an analysis-specific error
  createAnalysisError(message: string, retriable: boolean = true): Error {
    const error = new Error(message);
    error.name = "AnalysisError";
    return error;
  }
  
  // Method to create a Claude API-specific error
  createClaudeApiError(message: string, retriable: boolean = true): Error {
    const error = new Error(message);
    error.name = "ClaudeApiError";
    return error;
  }
}

// Export a singleton instance
export const errorService = new ErrorService();
