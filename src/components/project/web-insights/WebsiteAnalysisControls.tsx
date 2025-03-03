
import React from 'react';
import { Button } from "@/components/ui/button";
import { Project } from '@/lib/types';
import { FirecrawlApiKeyForm } from './FirecrawlApiKeyForm';
import { ArrowRight, Globe } from 'lucide-react';

interface WebsiteAnalysisControlsProps {
  project: Project;
  isAnalyzing: boolean;
  onAnalyzeWebsite: () => void;
  hasInsights: boolean;
}

export const WebsiteAnalysisControls: React.FC<WebsiteAnalysisControlsProps> = ({
  project,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights
}) => {
  const hasWebsiteUrl = !!project.clientWebsite;

  return (
    <div className="space-y-4">
      <FirecrawlApiKeyForm />
      
      {hasWebsiteUrl && (
        <div className="flex flex-col space-y-4">
          <Button
            onClick={onAnalyzeWebsite}
            disabled={isAnalyzing || !hasWebsiteUrl}
            className="w-full md:w-auto"
            size="lg"
          >
            <Globe className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing Website..." : hasInsights ? "Refresh Website Analysis" : "Start Website Analysis"}
            {!isAnalyzing && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          
          <p className="text-sm text-gray-500">
            Using Firecrawl for comprehensive analysis of {project.clientWebsite}
          </p>
        </div>
      )}
    </div>
  );
};
