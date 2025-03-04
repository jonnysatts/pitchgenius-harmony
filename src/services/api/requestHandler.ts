
import { supabase } from "@/integrations/supabase/client";
import { errorService, ErrorType } from "@/services/error/errorService";

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
 * Generic function to call Supabase Edge Functions with consistent error handling
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  payload: any,
  options: {
    timeoutMs?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const { timeoutMs = 30000, retries = 3, retryDelay = 1000 } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Calling edge function '${functionName}' (attempt ${attempt + 1}/${retries})`);
      
      // Call the Edge Function with timeout
      const responsePromise = supabase.functions.invoke(functionName, {
        body: payload
      });
      
      const response = await Promise.race([
        responsePromise,
        createTimeoutPromise(timeoutMs)
      ]);
      
      // Check for Edge Function errors
      if (response.error) {
        throw {
          type: ErrorType.API_ERROR,
          message: response.error.message || `Edge function '${functionName}' error`,
          status: response.error.code || 500
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
      
      // Determine if the error is retriable
      const isRetriable = 
        (error instanceof Error && (
          error.message.includes('timeout') ||
          error.message.includes('networkerror') ||
          error.message.includes('rate limit') ||
          error.message.includes('429') ||
          error.message.includes('overloaded')
        )) ||
        (typeof error === 'object' && error !== null && (
          (error as any).retriable === true ||
          (error as any).status === 429 ||
          (error as any).status === 503 ||
          (error as any).status === 504
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
    const response = await supabase.functions.invoke('test-connection', {
      body: { test: true }
    });
    
    if (response.error) {
      return {
        success: false,
        error: response.error.message,
        details: response.error
      };
    }
    
    return {
      success: true,
      details: response.data
    };
  } catch (error) {
    errorService.handleError(error, { context: 'test-edge-function' });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
