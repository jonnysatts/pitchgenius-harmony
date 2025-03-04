
import React from 'react';
import { AIProcessingStatus, Project } from '@/lib/types';
import { WebsiteAnalysisControls } from './WebsiteAnalysisControls';

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

  // Create a partial project object for WebsiteAnalysisControls
  // This satisfies the type check without needing the full Project type
  const projectForControls = websiteUrl ? {
    id: '1',
    clientWebsite: websiteUrl,
    title: '', // These props aren't used in WebsiteAnalysisControls but are required by Project type
    clientName: '',
    clientIndustry: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: '',
    description: ''
  } : undefined;

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
          project={projectForControls as Project} // We can safely cast here as we know it meets the required shape
          isAnalyzing={isAnalyzing}
          onAnalyzeWebsite={handleAnalyzeWebsite}
          hasInsights={hasInsights}
          aiStatus={aiStatus}
        />
      )}
    </div>
  );
};
