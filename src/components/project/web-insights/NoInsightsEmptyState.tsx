
import React from 'react';
import { AlertCircle, Globe } from 'lucide-react';

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
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 bg-amber-50 rounded-lg border border-dashed border-amber-300 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
        <h3 className="font-semibold text-lg mb-2">Website Analysis Failed</h3>
        <p className="text-gray-700 max-w-md mb-4">
          We encountered an issue when analyzing the website. This often happens due to website access restrictions, CORS policies, or the site being temporarily unavailable.
        </p>
        <div className="p-3 bg-white rounded border border-amber-200 text-left text-sm text-amber-700 max-w-md mb-3">
          <p><strong>Error:</strong> {error}</p>
        </div>
        <p className="text-gray-500 text-sm">
          Try a different website URL or check that the URL format is correct.
        </p>
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
