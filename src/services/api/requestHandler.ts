import { supabase } from "@/integrations/supabase/client";
import { errorService, ErrorType } from "@/services/error/errorService";
import { API_CONFIG, HTTP_STATUS, isRetriableError } from "./config";

// Track pending requests to avoid duplicates
const pendingRequests: Record<string, Promise<any>> = {};

/**
 * Timeout promise for API calls
 */
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Generate a unique request key for deduplication
 */
function generateRequestKey(functionName: string, payload: any): string {
  return `${functionName}:${JSON.stringify(payload)}`;
}

/**
 * Creates a request with AbortController support for cancellation
 */
function createCancellableRequest<T>(
  requestFn: (signal?: AbortSignal) => Promise<T>,
  timeoutMs: number
): { promise: Promise<T>; cancel: () => void } {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
  }, timeoutMs);
  
  const promise = requestFn(signal).finally(() => clearTimeout(timeoutId));
  
  return {
    promise,
    cancel: () => controller.abort(new Error('Request cancelled by user'))
  };
}

/**
 * Generic function to call Supabase Edge Functions with consistent error handling
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  payload: any,
  options: {
    timeoutMs?: number;
    retries?: number;
    retryDelay?: number;
    bypassCache?: boolean;
    cacheKey?: string;
  } = {}
): Promise<T> {
  const { 
    timeoutMs = API_CONFIG.timeouts.default, 
    retries = API_CONFIG.retry.maxRetries, 
    retryDelay = API_CONFIG.retry.baseDelay,
    bypassCache = false,
    cacheKey
  } = options;
  
  // Generate request key for deduplication
  const requestKey = cacheKey || generateRequestKey(functionName, payload);
  
  // Return existing in-flight request if one exists (deduplication)
  if (pendingRequests[requestKey]) {
    console.log(`Reusing pending request for '${functionName}'`);
    return pendingRequests[requestKey];
  }
  
  let lastError: Error | null = null;
  
  const requestPromise = (async () => {
    try {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          console.log(`Calling edge function '${functionName}' (attempt ${attempt + 1}/${retries})`);
          
          // Call the Edge Function with timeout and cancellation support
          const { promise } = createCancellableRequest(
            (signal) => supabase.functions.invoke(functionName, {
              body: payload,
              signal
            }),
            timeoutMs
          );
          
          const response = await promise;
          
          // Check for Edge Function errors
          if (response.error) {
            throw {
              type: ErrorType.API_ERROR,
              message: response.error.message || `Edge function '${functionName}' error`,
              status: response.error.code || HTTP_STATUS.SERVER_ERROR
            };
          }
          
          // Check for application-level errors in the response
          if (response.data?.error) {
            throw {
              type: response.data.errorType || ErrorType.API_ERROR,
              message: response.data.error,
              retriable: response.data.retriableError === true,
              originalResponse: response.data
            };
          }
          
          // Success case
          return response.data as T;
        } catch (error) {
          console.error(`Error in edge function '${functionName}' (attempt ${attempt + 1}):`, error);
          lastError = error instanceof Error ? error : new Error(String(error));
          
          // AbortError is usually due to timeout or cancellation - always retriable
          const isAbortError = error instanceof Error && error.name === 'AbortError';
          
          // Determine if the error is retriable
          const isRetriable = 
            isAbortError ||
            (error instanceof Error && (
              error.message.includes('timeout') ||
              error.message.includes('networkerror') ||
              error.message.includes('rate limit')
            )) ||
            (typeof error === 'object' && error !== null && (
              (error as any).retriable === true ||
              isRetriableError((error as any).status)
            ));
            
          // If not retriable or last attempt, throw the error
          if (!isRetriable || attempt >= retries - 1) {
            throw error;
          }
          
          // Wait before retry with exponential backoff
          const backoffTime = retryDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
      
      // This should never be reached due to the throw in the loop,
      // but is here for type safety
      throw lastError || new Error(`Failed to call edge function '${functionName}' after ${retries} attempts`);
    } finally {
      // Clean up pending request reference
      delete pendingRequests[requestKey];
    }
  })();
  
  // Store the promise for deduplication
  pendingRequests[requestKey] = requestPromise;
  
  return requestPromise;
}

/**
 * Test connection to Supabase Edge Functions
 */
export async function testEdgeFunctionConnection(): Promise<{
  success: boolean;
  details?: any;
  error?: string;
}> {
  try {
    const response = await callEdgeFunction(
      API_CONFIG.endpoints.edgeFunctions.testConnection, 
      { test: true },
      { timeoutMs: API_CONFIG.timeouts.short }
    );
    
    return {
      success: true,
      details: response
    };
  } catch (error) {
    errorService.handleError(error, { context: 'test-edge-function' });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
