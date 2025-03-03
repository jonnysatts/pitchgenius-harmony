
import React from 'react';
import { Project } from '@/lib/types';
import { WebsiteAnalysisControls } from './WebsiteAnalysisControls';

interface WebInsightsHeaderProps {
  project: Project;
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
}

const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({
  project,
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite = () => {},
  hasInsights
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Website Analysis</h2>
        <p className="text-muted-foreground">
          Analyze client website to extract strategic insights using AI
        </p>
      </div>
      
      <WebsiteAnalysisControls
        project={project}
        isAnalyzing={isAnalyzing}
        onAnalyzeWebsite={onAnalyzeWebsite}
        hasInsights={hasInsights}
      />
    </div>
  );
};

export default WebInsightsHeader;
