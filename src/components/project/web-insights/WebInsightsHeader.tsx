
import React from 'react';
import { AIProcessingStatus } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from 'lucide-react';

interface WebInsightsHeaderProps {
  websiteUrl?: string;
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
  aiStatus?: AIProcessingStatus;
}

export const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({
  websiteUrl,
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights,
  aiStatus
}) => {
  const handleAnalyzeWebsite = () => {
    if (onAnalyzeWebsite) {
      onAnalyzeWebsite();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Website Insights</h2>
      </div>
      
      <p className="text-slate-600 mb-6">
        Analyze your client's website to generate additional strategic insights for potential gaming partnerships.
        Our AI will examine the website content and structure to identify key opportunities.
      </p>
      
      {/* Only show the button in the header if we're not analyzing and there's a valid website URL */}
      {hasWebsiteUrl && !isAnalyzing && onAnalyzeWebsite && (
        <Button
          onClick={handleAnalyzeWebsite}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6"
          size="lg"
        >
          <Globe className="mr-2 h-5 w-5" />
          Start Website Analysis
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
