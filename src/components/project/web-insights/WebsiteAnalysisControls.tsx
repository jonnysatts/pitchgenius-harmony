
import React from 'react';
import { Button } from "@/components/ui/button";
import { Project } from '@/lib/types';
import { FirecrawlApiKeyForm } from './FirecrawlApiKeyForm';
import { ArrowRight, Globe, Server, RefreshCw } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

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
  const [progress, setProgress] = React.useState(0);
  
  // Simulate progress when analysis starts
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          // Move slower through different phases
          if (prev < 30) return prev + 2; // Initial phase
          if (prev < 60) return prev + 0.5; // API processing phase
          if (prev < 90) return prev + 1; // Final phase
          return prev;
        });
      }, 300);
    } else {
      setProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

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
          
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{progress < 30 ? 'Preparing analysis...' : 
                       progress < 60 ? 'Processing website content...' :
                       progress < 90 ? 'Generating insights...' :
                       'Finalizing analysis...'}</span>
                <span>{Math.min(Math.round(progress), 99)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="w-full"
                indicatorColor={progress >= 30 && progress < 60 ? "bg-blue-500" : undefined}
                showAnimation={progress >= 30 && progress < 60}
              />
              <p className="text-xs text-slate-500 italic">
                {progress >= 30 && progress < 60 ? 
                  "Our AI is analyzing your website content. This may take up to 2 minutes..." :
                  "Processing website content for strategic insights..."}
              </p>
            </div>
          )}
          
          <Button
            onClick={onAnalyzeWebsite}
            disabled={isAnalyzing || !hasWebsiteUrl}
            className="w-full md:w-auto"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Globe className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Website...
              </>
            ) : hasInsights ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Website Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Start Website Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500">
            Using Firecrawl via Supabase for enhanced analysis of {project.clientWebsite}
          </p>
        </div>
      )}
    </div>
  );
};
