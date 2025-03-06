import { toast } from "sonner";

// Error types for better categorization
export enum ErrorType {
  // Document-related errors
  DOCUMENT_UPLOAD = "document_upload",
  DOCUMENT_FETCH = "document_fetch",
  DOCUMENT_DELETE = "document_delete",
  DOCUMENT_PROCESS = "document_process",
  
  // API-related errors
  API_CONNECTION = "api_connection",
  API_TIMEOUT = "api_timeout",
  API_RESPONSE = "api_response",
  
  // Storage-related errors
  STORAGE_WRITE = "storage_write",
  STORAGE_READ = "storage_read",
  STORAGE_DELETE = "storage_delete",
  
  // Authentication-related errors
  AUTH_REQUIRED = "auth_required",
  AUTH_EXPIRED = "auth_expired",
  AUTH_INVALID = "auth_invalid",
  
  // Project-related errors
  PROJECT_NOT_FOUND = "project_not_found",
  PROJECT_INVALID = "project_invalid",
  
  // Validation errors
  VALIDATION = "validation",
  
  // Other errors
  UNKNOWN = "unknown"
}

// Context for the error
interface ErrorContext {
  context: string;
  [key: string]: any;
}

// Error service for centralized error handling
class ErrorService {
  // Keep track of shown errors to prevent duplicates
  private shownErrors: Map<string, number> = new Map();
  
  // Create a unique key for an error to prevent duplicates
  private createErrorKey(error: Error | string, context?: ErrorContext): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const contextKey = context ? JSON.stringify(context) : '';
    return `${errorMessage}-${contextKey}`;
  }
  
  // Determine error type based on error and context
  private determineErrorType(error: Error | string, context?: ErrorContext): ErrorType {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Document-related errors
    if (context?.context?.includes('document-upload') || errorMessage.includes('upload')) {
      return ErrorType.DOCUMENT_UPLOAD;
    }
    
    if (context?.context?.includes('document-fetch') || errorMessage.includes('fetch document')) {
      return ErrorType.DOCUMENT_FETCH;
    }
    
    if (context?.context?.includes('document-delete') || errorMessage.includes('delete document') || errorMessage.includes('remove document')) {
      return ErrorType.DOCUMENT_DELETE;
    }
    
    if (context?.context?.includes('document-process') || errorMessage.includes('process document')) {
      return ErrorType.DOCUMENT_PROCESS;
    }
    
    // API-related errors
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('offline')) {
      return ErrorType.API_CONNECTION;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return ErrorType.API_TIMEOUT;
    }
    
    if (errorMessage.includes('response') || errorMessage.includes('status')) {
      return ErrorType.API_RESPONSE;
    }
    
    // Storage-related errors
    if (context?.context?.includes('storage') && (errorMessage.includes('write') || errorMessage.includes('save'))) {
      return ErrorType.STORAGE_WRITE;
    }
    
    if (context?.context?.includes('storage') && (errorMessage.includes('read') || errorMessage.includes('get'))) {
      return ErrorType.STORAGE_READ;
    }
    
    if (context?.context?.includes('storage') && (errorMessage.includes('delete') || errorMessage.includes('remove'))) {
      return ErrorType.STORAGE_DELETE;
    }
    
    // Project-related errors
    if (errorMessage.includes('project not found') || errorMessage.includes('project does not exist')) {
      return ErrorType.PROJECT_NOT_FOUND;
    }
    
    if (errorMessage.includes('project') && (errorMessage.includes('invalid') || errorMessage.includes('error'))) {
      return ErrorType.PROJECT_INVALID;
    }
    
    // Validation errors
    if (
      errorMessage.includes('invalid') || 
      errorMessage.includes('validation') || 
      errorMessage.includes('required') ||
      errorMessage.includes('exceed') ||
      errorMessage.includes('too large') ||
      errorMessage.includes('unsupported')
    ) {
      return ErrorType.VALIDATION;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  // Get a user-friendly message based on error type
  private getUserFriendlyMessage(errorType: ErrorType, error: Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    switch (errorType) {
      case ErrorType.DOCUMENT_UPLOAD:
        return "Failed to upload document. Please check your file and try again.";
      
      case ErrorType.DOCUMENT_FETCH:
        return "Could not retrieve documents. Please try refreshing the page.";
      
      case ErrorType.DOCUMENT_DELETE:
        return "Failed to delete document. Please try again later.";
      
      case ErrorType.DOCUMENT_PROCESS:
        return "Document processing failed. The file may be corrupted or in an unsupported format.";
      
      case ErrorType.API_CONNECTION:
        return "Connection error. Please check your internet connection and try again.";
      
      case ErrorType.API_TIMEOUT:
        return "The request timed out. Please try again later.";
      
      case ErrorType.API_RESPONSE:
        return "Server error. Our team has been notified and is working on a fix.";
      
      case ErrorType.STORAGE_WRITE:
        return "Failed to save data. Please try again later.";
      
      case ErrorType.STORAGE_READ:
        return "Failed to load data. Please refresh the page.";
      
      case ErrorType.STORAGE_DELETE:
        return "Failed to delete data. Please try again later.";
      
      case ErrorType.PROJECT_NOT_FOUND:
        return "Project not found. It may have been deleted or you may not have access to it.";
      
      case ErrorType.PROJECT_INVALID:
        return "Invalid project data. Please try refreshing the page.";
      
      case ErrorType.VALIDATION:
        return errorMessage;
      
      case ErrorType.UNKNOWN:
      default:
        return "An unexpected error occurred. Please try again or contact support if the issue persists.";
    }
  }
  
  // Handle an error by logging it and showing a toast notification
  public handleError(error: Error | string, context?: ErrorContext): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorType = this.determineErrorType(error, context);
    const errorKey = this.createErrorKey(error, context);
    
    // Log error details
    console.error(`[${errorType}] Error:`, errorMessage, context);
    
    // Check if we've shown this error recently
    const now = Date.now();
    const lastShown = this.shownErrors.get(errorKey);
    
    // Only show the same error once every 5 seconds
    if (!lastShown || (now - lastShown > 5000)) {
      this.shownErrors.set(errorKey, now);
      
      // Get a user-friendly message
      const userMessage = this.getUserFriendlyMessage(errorType, error);
      
      // Show a toast notification with the error
      toast.error("Error", {
        description: userMessage,
        duration: 5000,
      });
    }
  }
  
  // Clear all tracked errors
  public clearErrors(): void {
    this.shownErrors.clear();
  }
  
  // Get suggestions for fixing an error
  public getSuggestions(errorType: ErrorType): string[] {
    switch (errorType) {
      case ErrorType.DOCUMENT_UPLOAD:
        return [
          "Check that your file is not too large (max 25MB)",
          "Make sure the file type is supported (PDF, DOC, DOCX, TXT, PPT, PPTX)",
          "Try uploading a different file",
          "Refresh the page and try again"
        ];
      
      case ErrorType.API_CONNECTION:
        return [
          "Check your internet connection",
          "Try again in a few minutes",
          "Refresh the page"
        ];
      
      case ErrorType.VALIDATION:
        return [
          "Review the error message carefully",
          "Make sure all required fields are filled out",
          "Check for incorrect formatting"
        ];
      
      default:
        return [
          "Refresh the page and try again",
          "Log out and log back in",
          "Clear your browser cache and cookies"
        ];
    }
  }
}

// Create a singleton instance
export const errorService = new ErrorService();
