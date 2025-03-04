
import { useCallback } from "react";
import { errorService, ErrorType, ErrorDetails } from "@/services/error/errorService";

export function useErrorHandler() {
  // Generic error handler
  const handleError = useCallback((error: unknown, context?: Record<string, any>): ErrorDetails => {
    return errorService.handleError(error, context);
  }, []);
  
  // Analysis-specific error handler
  const handleAnalysisError = useCallback((error: unknown, context?: Record<string, any>): ErrorDetails => {
    // Pre-categorize as analysis error
    const analysisError = error instanceof Error 
      ? error 
      : errorService.createAnalysisError(typeof error === 'string' ? error : 'Analysis failed');
    
    return errorService.handleError(analysisError, {
      category: 'analysis',
      ...context
    });
  }, []);
  
  // Claude API-specific error handler
  const handleClaudeApiError = useCallback((error: unknown, context?: Record<string, any>): ErrorDetails => {
    // Pre-categorize as Claude API error
    const claudeError = error instanceof Error 
      ? error 
      : errorService.createClaudeApiError(typeof error === 'string' ? error : 'Claude API error');
    
    return errorService.handleError(claudeError, {
      category: 'claude_api',
      ...context
    });
  }, []);
  
  // Check if an error is retriable
  const isRetriableError = useCallback((error: unknown): boolean => {
    const errorDetails = errorService.handleError(error);
    return errorDetails.retriable;
  }, []);
  
  return {
    handleError,
    handleAnalysisError,
    handleClaudeApiError,
    isRetriableError,
    ErrorType
  };
}
