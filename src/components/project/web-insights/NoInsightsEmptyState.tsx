
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, Globe } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';

interface NoInsightsEmptyStateProps {
  hasWebsiteUrl: boolean;
  isAnalyzing?: boolean;
  onAnalyzeWebsite?: () => void;
}

const NoInsightsEmptyState = ({
  hasWebsiteUrl,
  isAnalyzing = false,
  onAnalyzeWebsite
}: NoInsightsEmptyStateProps) => {
  const hasFirecrawlKey = !!FirecrawlService.getApiKey();
  
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

  return (
    <div className="flex flex-col items-center justify-center p-8 mt-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
      <Globe className="h-10 w-10 text-gray-400 mb-4" />
      <h3 className="font-semibold text-lg mb-2">
        {isAnalyzing ? "Analyzing Website..." : "No Website Insights Yet"}
      </h3>
      
      <p className="text-gray-500 max-w-md mb-6">
        {isAnalyzing 
          ? "Please wait while we analyze the website content and generate strategic insights."
          : hasFirecrawlKey 
            ? "Start the analysis to extract strategic insights from the website using the Firecrawl API for comprehensive content analysis."
            : "Start the analysis to extract strategic insights from the website. For better results, add a Firecrawl API key."
        }
      </p>
      
      {!isAnalyzing && (
        <Button 
          onClick={onAnalyzeWebsite} 
          disabled={isAnalyzing}
          size="lg"
        >
          <Globe className="mr-2 h-4 w-4" />
          Start Website Analysis
        </Button>
      )}
      
      {isAnalyzing && (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export { NoInsightsEmptyState };
