
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LoaderCircle, ServerCrash, XCircle, Info, TerminalSquare, Key } from "lucide-react";
import { Link } from "react-router-dom";

interface InsightsErrorAlertProps {
  error?: string | null;
  usingFallbackInsights?: boolean;
  onRetryAnalysis?: () => void;
  isClaudeProcessing?: boolean;
  apiKeyStatus?: {
    checked?: boolean;
    exists?: boolean;
    validFormat?: boolean;
  };
}

const InsightsErrorAlert: React.FC<InsightsErrorAlertProps> = ({ 
  error, 
  usingFallbackInsights, 
  onRetryAnalysis,
  isClaudeProcessing = false,
  apiKeyStatus
}) => {
  if (!error && !usingFallbackInsights && !isClaudeProcessing) return null;
  
  // Determine if this is an API key missing error
  const isApiKeyMissing = error?.includes('ANTHROPIC_API_KEY not found') || 
                         error?.includes('Missing Anthropic API key');
  
  // Determine if this is an Edge Function error
  const isEdgeFunctionError = error?.includes('Edge Function') || error?.includes('non-2xx status code');
  
  // Determine if this is a Claude API error
  const isClaudeApiError = error?.includes('Claude API') || error?.includes('invalid_request_error');
  
  // Determine if this is a content error
  const isContentError = error?.includes('insufficient') || error?.includes('content too short') || 
                         error?.includes('Failed to fetch website content');
                         
  // Determine if this is a Claude overload error
  const isClaudeOverloaded = error?.includes('overloaded') || error?.includes('529');
  
  if (isClaudeProcessing) {
    return (
      <Alert variant="default" className="mb-4 border-blue-300 bg-blue-50">
        <LoaderCircle className="h-4 w-4 text-blue-500 animate-spin" />
        <AlertDescription className="flex justify-between items-center text-blue-800">
          <div>
            Claude AI is currently analyzing your documents. This may take up to 2 minutes. Please wait...
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Add specific alert for fallback insights
  if (usingFallbackInsights && !error) {
    return (
      <Alert variant="default" className="mb-4 border-amber-300 bg-amber-50">
        <Info className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">Using Sample Insights</AlertTitle>
        <AlertDescription className="flex justify-between items-center text-amber-800">
          <div>
            You're currently viewing sample insights because Claude AI analysis is not available. These are examples to demonstrate the format of insights, but do not represent actual analysis of your documents.
            
            <div className="mt-2 text-sm">
              <p>To get real AI analysis:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Ensure the ANTHROPIC_API_KEY is set in your Supabase secrets</li>
                <li>Check that your documents contain sufficient content for analysis</li>
                <li>Verify your Supabase Edge Function is deployed correctly</li>
              </ul>
            </div>
          </div>
          
          {onRetryAnalysis && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1 ml-4 border-amber-500 text-amber-700 hover:bg-amber-100"
              onClick={onRetryAnalysis}
            >
              <RefreshCw size={14} />
              Retry with Claude AI
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert 
      variant={isEdgeFunctionError || isClaudeApiError ? "destructive" : "default"} 
      className={`mb-4 ${isEdgeFunctionError || isClaudeApiError ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}
    >
      {isEdgeFunctionError ? (
        <ServerCrash className="h-4 w-4 text-red-500" />
      ) : isClaudeApiError ? (
        <XCircle className="h-4 w-4 text-red-500" /> 
      ) : isApiKeyMissing ? (
        <Key className="h-4 w-4 text-red-500" />
      ) : isClaudeOverloaded ? (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
      
      <div className="w-full">
        {/* Error Title */}
        {isEdgeFunctionError && <AlertTitle className="text-red-700">Supabase Edge Function Error</AlertTitle>}
        {isApiKeyMissing && <AlertTitle className="text-red-700">Anthropic API Key Missing</AlertTitle>}
        {isClaudeApiError && !isClaudeOverloaded && <AlertTitle className="text-red-700">Claude AI API Error</AlertTitle>}
        {isClaudeOverloaded && <AlertTitle className="text-amber-700">Claude AI Currently Overloaded</AlertTitle>}
        {isContentError && <AlertTitle className="text-amber-700">Website Content Issue</AlertTitle>}
        {!isEdgeFunctionError && !isApiKeyMissing && !isClaudeApiError && !isContentError && !isClaudeOverloaded && usingFallbackInsights && 
          <AlertTitle className="text-amber-700">Using Sample Insights</AlertTitle>}
        {!isEdgeFunctionError && !isApiKeyMissing && !isClaudeApiError && !isContentError && !isClaudeOverloaded && !usingFallbackInsights &&
          <AlertTitle className="text-amber-700">Analysis Issue</AlertTitle>}
        
        <AlertDescription 
          className={`flex justify-between items-center ${
            isEdgeFunctionError || (isClaudeApiError && !isClaudeOverloaded) ? 'text-red-700' : 'text-amber-800'
          }`}
        >
          <div>
            {error || "Using sample insights due to API timeout. Please try again later for Claude AI analysis."}
            
            {/* Add API key status information */}
            {apiKeyStatus && (
              <div className="mt-2 text-sm p-2 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-semibold flex items-center">
                  <Key className="h-3.5 w-3.5 mr-1" /> Anthropic API Key Status:
                </p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Checked: {apiKeyStatus.checked ? 'Yes' : 'No'}</li>
                  <li>Found: {apiKeyStatus.exists ? 'Yes' : 'No'}</li>
                  {apiKeyStatus.validFormat !== undefined && (
                    <li>Valid Format: {apiKeyStatus.validFormat ? 'Yes' : 'No'}</li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Adding explanation for fallback insights */}
            {usingFallbackInsights && (
              <div className="mt-2 text-sm">
                <p>The sample insights you're seeing are placeholders and don't reflect actual analysis of your documents.</p>
                <p>When Claude AI is properly configured, you'll receive detailed, specific insights based on your documents.</p>
              </div>
            )}
            
            {/* Special explanation for overloaded error */}
            {isClaudeOverloaded && (
              <div className="mt-2 text-sm">
                <p>Claude AI's servers are currently overloaded. This is a temporary issue on Anthropic's side.</p>
                <p>To resolve this:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Wait a few minutes and try the analysis again</li>
                  <li>Try at a different time of day when usage may be lower</li>
                  <li>Sample insights are being shown for demonstration purposes</li>
                </ul>
              </div>
            )}
            
            {/* Specific additional content based on error type */}
            {isApiKeyMissing && !isClaudeOverloaded && (
              <div className="mt-2 text-sm">
                <p>The ANTHROPIC_API_KEY is missing from your Supabase secrets or can't be accessed by the Edge Function.</p>
                <p>To fix this:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Go to the Supabase dashboard</li>
                  <li>Navigate to Project Settings → Edge Functions → Secrets</li>
                  <li>Add a secret with name ANTHROPIC_API_KEY and your Claude API key as the value</li>
                  <li>Restart your Edge Function after adding the secret</li>
                </ul>
              </div>
            )}
            
            {isEdgeFunctionError && !isApiKeyMissing && !isClaudeOverloaded && (
              <div className="mt-2 text-sm">
                <p>There was a problem connecting to the Supabase Edge Function for Claude AI.</p>
                <p>This could be due to:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The Edge Function not being deployed properly</li>
                  <li>Missing Anthropic API key in Supabase secrets</li>
                  <li>Temporary Supabase service disruption</li>
                  <li>Check the Edge Function logs for detailed error information</li>
                </ul>
                <div className="mt-2 flex items-center">
                  <TerminalSquare className="h-3.5 w-3.5 mr-1 text-red-700" />
                  <a 
                    href="https://supabase.com/dashboard/project/nryafptwknnftdjugoyn/functions/analyze-website-with-anthropic/logs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-700 underline"
                  >
                    View Edge Function Logs
                  </a>
                </div>
              </div>
            )}
            
            {isClaudeApiError && !isClaudeOverloaded && (
              <div className="mt-2 text-sm">
                <p>There was a problem calling the Claude AI API:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The API key might be incorrect or expired</li>
                  <li>The request may have exceeded Claude's token limits</li>
                  <li>There may be temporary service issues with Anthropic's API</li>
                </ul>
              </div>
            )}
            
            {isContentError && !isClaudeOverloaded && (
              <div className="mt-2 text-sm">
                <p>There was an issue with the content:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The documents might not contain enough meaningful text for analysis</li>
                  <li>The content might be in a format Claude cannot process effectively</li>
                  <li>Try uploading documents with more detailed information</li>
                </ul>
              </div>
            )}
          </div>
          
          {onRetryAnalysis && (
            <Button 
              size="sm" 
              variant="outline" 
              className={`flex items-center gap-1 ml-4 ${
                isEdgeFunctionError || (isClaudeApiError && !isClaudeOverloaded)
                  ? 'border-red-500 text-red-700 hover:bg-red-100' 
                  : 'border-amber-500 text-amber-700 hover:bg-amber-100'
              }`}
              onClick={onRetryAnalysis}
            >
              <RefreshCw size={14} />
              {isClaudeOverloaded ? "Retry Later" : "Retry with Claude AI"}
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default InsightsErrorAlert;
