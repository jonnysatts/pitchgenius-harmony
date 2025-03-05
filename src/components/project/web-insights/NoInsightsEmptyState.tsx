
import React from 'react';
import { AlertCircle, Globe, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoInsightsEmptyStateProps {
  hasWebsiteUrl: boolean;
  isAnalyzing?: boolean;
  error?: string | null;
}

export const NoInsightsEmptyState = ({
  hasWebsiteUrl,
  isAnalyzing = false,
  error = null
}: NoInsightsEmptyStateProps) => {
  if (!hasWebsiteUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Website URL Provided</h3>
        <p className="text-gray-500 max-w-md mb-4">
          Add a website URL to the project details to enable website analysis.
        </p>
      </div>
    );
  }

  if (error) {
    // Determine specific error type for more helpful messaging
    const isClaudeOverloaded = error.includes('overloaded') || error.includes('Claude API');
    const isHttpError = error.includes('HTTP error') || error.includes('403') || error.includes('401');
    const isCorsError = error.includes('CORS') || error.includes('cross-origin');
    const isTimeoutError = error.includes('timeout') || error.includes('timed out');
    const isEdgeFunctionError = error.includes('Edge Function') || error.includes('non-2xx status code');
    const isContentExtractionError = error.includes('extract meaningful content') || 
                                    error.includes('content extraction') || 
                                    error.includes('insufficient content');
    
    // Set title and explanation based on error type
    let errorTitle = isClaudeOverloaded 
      ? "Claude API Temporarily Unavailable" 
      : isEdgeFunctionError
      ? "Server Connection Failed"
      : isContentExtractionError
      ? "Content Extraction Failed"
      : "Website Analysis Failed";
      
    let errorExplanation = "";
    
    if (isClaudeOverloaded) {
      errorExplanation = "The Claude AI service is currently experiencing high demand. This is a temporary issue.";
    } else if (isHttpError) {
      errorExplanation = "The website is blocking access to automated tools. This is a common security measure many websites use.";
    } else if (isCorsError) {
      errorExplanation = "The website has Cross-Origin Resource Sharing (CORS) restrictions that prevent our tools from accessing it.";
    } else if (isTimeoutError) {
      errorExplanation = "The connection to the website timed out. The site may be slow or temporarily unavailable.";
    } else if (isEdgeFunctionError) {
      errorExplanation = "The server-side function needed to analyze websites is currently unavailable. This is likely a temporary issue.";
    } else if (isContentExtractionError) {
      errorExplanation = "We couldn't extract meaningful content from the website. This often happens with sites that use heavy JavaScript, have anti-scraping measures, or serve primarily visual content.";
    } else {
      errorExplanation = "We encountered an issue when analyzing the website. This often happens due to website access restrictions, CORS policies, or the site being temporarily unavailable.";
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 bg-amber-50 rounded-lg border border-dashed border-amber-300 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
        <h3 className="font-semibold text-lg mb-2">{errorTitle}</h3>
        <p className="text-gray-700 max-w-md mb-4">{errorExplanation}</p>
        
        <div className="p-3 bg-white rounded border border-amber-200 text-left text-sm text-amber-700 max-w-md mb-3">
          <p><strong>Error:</strong> {error}</p>
        </div>
        
        <div className="text-gray-700 text-sm bg-white p-3 rounded border border-amber-200 max-w-md mb-4">
          <p className="font-medium flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            Suggestions:
          </p>
          <ul className="list-disc pl-5 mt-1.5 space-y-1.5">
            {isHttpError || isCorsError || isContentExtractionError ? (
              <>
                <li>Try a different website that doesn't have strict security measures</li>
                <li>Use a simpler website with less JavaScript complexity</li>
                <li>Check that the website URL format is correct</li>
              </>
            ) : isClaudeOverloaded ? (
              <li>Wait a few minutes and try again when the AI service is less busy</li>
            ) : (
              <>
                <li>Try a different website URL</li>
                <li>Check your internet connection</li>
                <li>Try again in a few minutes</li>
              </>
            )}
          </ul>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <a href="/diagnostics" target="_blank" className="flex items-center gap-1.5">
              Run Diagnostics
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 mt-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
      <Globe className="h-10 w-10 text-gray-400 mb-4" />
      <h3 className="font-semibold text-lg mb-2">
        {isAnalyzing ? "Analyzing Website..." : "No Website Insights Yet"}
      </h3>
      
      <p className="text-gray-500 max-w-md mb-6">
        {isAnalyzing 
          ? "Please wait while we analyze the website content and generate strategic insights. This may take up to 2 minutes for complex websites."
          : "The website has been set up for analysis. Use the 'Analyze Website' button at the top of the page to start the process."
        }
      </p>
      
      {isAnalyzing && (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-medium">Note:</span> Website analysis uses the Firecrawl API to extract content and Claude AI to generate insights.
          </p>
        </div>
      )}
    </div>
  );
};
