
import React from 'react';
import { Button } from "@/components/ui/button";
import { Project } from '@/lib/types';
import { FirecrawlApiKeyForm } from './FirecrawlApiKeyForm';
import { ArrowRight, Globe, Server } from 'lucide-react';

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
          <div className="flex items-start space-x-2 p-4 bg-green-50 rounded-md border border-green-100">
            <Server className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Enhanced Analysis Available</p>
              <p className="text-sm text-green-600 mt-1">
                Firecrawl is now active via Supabase for comprehensive website analysis
                with advanced website scraping capabilities.
              </p>
            </div>
          </div>
          
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
            Using Firecrawl via Supabase for enhanced analysis of {project.clientWebsite}
          </p>
        </div>
      )}
    </div>
  );
};
