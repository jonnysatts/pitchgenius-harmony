
import React from 'react';
import { AIProcessingStatus } from '@/lib/types';
import { WebsiteAnalysisControls } from './WebsiteAnalysisControls';

interface WebInsightsHeaderProps {
  websiteUrl?: string;
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
  aiStatus?: AIProcessingStatus; // Add aiStatus prop
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
      
      {hasWebsiteUrl && websiteUrl && onAnalyzeWebsite && (
        <WebsiteAnalysisControls
          project={{ id: '1', clientWebsite: websiteUrl }}
          isAnalyzing={isAnalyzing}
          onAnalyzeWebsite={handleAnalyzeWebsite}
          hasInsights={hasInsights}
          aiStatus={aiStatus} // Pass aiStatus to enable improved feedback
        />
      )}
    </div>
  );
};
