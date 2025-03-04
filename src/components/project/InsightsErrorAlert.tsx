
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LoaderCircle, ServerCrash, XCircle } from "lucide-react";

interface InsightsErrorAlertProps {
  error?: string | null;
  usingFallbackInsights?: boolean;
  onRetryAnalysis?: () => void;
  isClaudeProcessing?: boolean;
}

const InsightsErrorAlert: React.FC<InsightsErrorAlertProps> = ({ 
  error, 
  usingFallbackInsights, 
  onRetryAnalysis,
  isClaudeProcessing = false
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
  
  return (
    <Alert 
      variant={isEdgeFunctionError || isClaudeApiError ? "destructive" : "default"} 
      className={`mb-4 ${isEdgeFunctionError || isClaudeApiError ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}
    >
      {isEdgeFunctionError ? (
        <ServerCrash className="h-4 w-4 text-red-500" />
      ) : isClaudeApiError ? (
        <XCircle className="h-4 w-4 text-red-500" /> 
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
      
      <div className="w-full">
        {/* Error Title */}
        {isEdgeFunctionError && <AlertTitle className="text-red-700">Supabase Edge Function Error</AlertTitle>}
        {isApiKeyMissing && <AlertTitle className="text-red-700">Anthropic API Key Missing</AlertTitle>}
        {isClaudeApiError && <AlertTitle className="text-red-700">Claude AI API Error</AlertTitle>}
        {isContentError && <AlertTitle className="text-amber-700">Website Content Issue</AlertTitle>}
        {!isEdgeFunctionError && !isApiKeyMissing && !isClaudeApiError && !isContentError && 
          <AlertTitle className="text-amber-700">Analysis Issue</AlertTitle>}
        
        <AlertDescription 
          className={`flex justify-between items-center ${
            isEdgeFunctionError || isClaudeApiError ? 'text-red-700' : 'text-amber-800'
          }`}
        >
          <div>
            {error || "Using sample insights due to API timeout. Please try again later for Claude AI analysis."}
            
            {/* Specific additional content based on error type */}
            {isApiKeyMissing && (
              <div className="mt-2 text-sm">
                <p>The ANTHROPIC_API_KEY is missing from your Supabase secrets.</p>
                <p>To fix this:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Go to the Supabase dashboard</li>
                  <li>Navigate to Project Settings → Edge Functions → Secrets</li>
                  <li>Add a secret with name ANTHROPIC_API_KEY and your Claude API key as the value</li>
                </ul>
              </div>
            )}
            
            {isEdgeFunctionError && !isApiKeyMissing && (
              <div className="mt-2 text-sm">
                <p>There was a problem connecting to the Supabase Edge Function for Claude AI.</p>
                <p>This could be due to:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The Edge Function not being deployed properly</li>
                  <li>Missing Anthropic API key in Supabase secrets</li>
                  <li>Temporary Supabase service disruption</li>
                </ul>
              </div>
            )}
            
            {isClaudeApiError && (
              <div className="mt-2 text-sm">
                <p>There was a problem calling the Claude AI API:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The API key might be incorrect or expired</li>
                  <li>The request may have exceeded Claude's token limits</li>
                  <li>There may be temporary service issues with Anthropic's API</li>
                </ul>
              </div>
            )}
            
            {isContentError && (
              <div className="mt-2 text-sm">
                <p>There was an issue with the website content:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The website might block automated scraping</li>
                  <li>The content might be loaded dynamically via JavaScript</li>
                  <li>The website might be temporarily down or have minimal content</li>
                  <li>Try analyzing a different website with more accessible content</li>
                </ul>
              </div>
            )}
          </div>
          
          {onRetryAnalysis && (
            <Button 
              size="sm" 
              variant="outline" 
              className={`flex items-center gap-1 ml-4 ${
                isEdgeFunctionError || isClaudeApiError
                  ? 'border-red-500 text-red-700 hover:bg-red-100' 
                  : 'border-amber-500 text-amber-700 hover:bg-amber-100'
              }`}
              onClick={onRetryAnalysis}
            >
              <RefreshCw size={14} />
              Retry with Claude AI
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default InsightsErrorAlert;
