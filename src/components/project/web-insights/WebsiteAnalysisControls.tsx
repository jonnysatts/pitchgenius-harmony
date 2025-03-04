
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Project, AIProcessingStatus } from '@/lib/types';
import { FirecrawlApiKeyForm } from './FirecrawlApiKeyForm';
import { ArrowRight, Globe, Server, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface WebsiteAnalysisControlsProps {
  project: Project;
  isAnalyzing: boolean;
  onAnalyzeWebsite: () => void;
  hasInsights: boolean;
  aiStatus?: AIProcessingStatus;
}

export const WebsiteAnalysisControls: React.FC<WebsiteAnalysisControlsProps> = ({
  project,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights,
  aiStatus
}) => {
  const hasWebsiteUrl = !!project.clientWebsite;
  
  // Use the aiStatus for progress if available, otherwise use our simpler progress
  const [internalProgress, setInternalProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState('');
  
  // Determine which progress and message to show
  const progress = aiStatus?.progress ?? internalProgress;
  const message = aiStatus?.message ?? statusMessage;
  
  // Determine current analysis phase for UI customization
  const isInitialPhase = progress < 25;
  const isCrawlingPhase = progress >= 25 && progress < 40;
  const isProcessingPhase = progress >= 40 && progress < 60;
  const isInsightPhase = progress >= 60 && progress < 95;
  const isFinalizingPhase = progress >= 95;
  
  // Handle manual progress simulation when aiStatus isn't provided
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing && !aiStatus) {
      setInternalProgress(0);
      setStatusMessage('Preparing to analyze website...');
      
      interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev < 20) {
            setStatusMessage('Fetching website content...');
            return prev + 2;
          } else if (prev < 40) {
            setStatusMessage('Crawling website pages...');
            return prev + 1;
          } else if (prev < 60) {
            setStatusMessage('Claude AI is analyzing website data...');
            return prev + 0.3;
          } else if (prev < 80) {
            setStatusMessage('Generating strategic insights...');
            return prev + 0.8;
          } else if (prev < 95) {
            setStatusMessage('Finalizing analysis...');
            return prev + 0.5;
          } else if (prev < 100) {
            setStatusMessage('Completing analysis...');
            return prev + 0.2;
          }
          return prev;
        });
      }, 300);
    } else if (!isAnalyzing) {
      setInternalProgress(0);
      setStatusMessage('');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, aiStatus]);

  // Show a success message when analysis completes
  useEffect(() => {
    if (isAnalyzing === false && internalProgress > 90) {
      // Reset internal progress after completion
      setInternalProgress(0);
      
      // Only show completion toast if aiStatus isn't handling it
      if (!aiStatus) {
        toast({
          title: "Analysis Complete",
          description: "Website insights are now available",
        });
      }
    }
  }, [isAnalyzing, internalProgress, aiStatus]);

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
            <div className="space-y-3">
              {/* Analysis status alert */}
              <Alert 
                className={`${isProcessingPhase ? 'bg-blue-50 border-blue-200' : 
                           isInsightPhase ? 'bg-indigo-50 border-indigo-200' :
                           isFinalizingPhase ? 'bg-emerald-50 border-emerald-200' :
                           'bg-amber-50 border-amber-200'}`}
              >
                <div className="flex items-center">
                  {isProcessingPhase ? (
                    <Globe className="h-4 w-4 text-blue-500 mr-2 animate-pulse" />
                  ) : isInsightPhase ? (
                    <Globe className="h-4 w-4 text-indigo-500 mr-2" />
                  ) : isFinalizingPhase ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                  ) : (
                    <Globe className="h-4 w-4 text-amber-500 mr-2 animate-spin" />
                  )}
                  <AlertTitle 
                    className={`${isProcessingPhase ? 'text-blue-700' : 
                               isInsightPhase ? 'text-indigo-700' :
                               isFinalizingPhase ? 'text-emerald-700' :
                               'text-amber-700'}`}
                  >
                    {isProcessingPhase ? 'AI Processing' : 
                     isInsightPhase ? 'Generating Insights' :
                     isFinalizingPhase ? 'Almost Complete' :
                     'Website Crawling'}
                  </AlertTitle>
                </div>
                <AlertDescription 
                  className={`mt-1 ${isProcessingPhase ? 'text-blue-600' : 
                               isInsightPhase ? 'text-indigo-600' :
                               isFinalizingPhase ? 'text-emerald-600' :
                               'text-amber-600'}`}
                >
                  {message}
                </AlertDescription>
              </Alert>
              
              {/* Progress bar with phase indication */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${isProcessingPhase ? 'text-blue-600' : 
                                   isInsightPhase ? 'text-indigo-600' :
                                   isFinalizingPhase ? 'text-emerald-600' :
                                   'text-amber-600'}`}>
                    {Math.min(Math.round(progress), 99)}%
                  </span>
                  <span className="text-slate-600">
                    {isProcessingPhase ? "Claude AI Analysis" : 
                     isInsightPhase ? "Insight Generation" :
                     isFinalizingPhase ? "Finalizing" :
                     "Website Crawling"}
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="w-full h-2.5"
                  indicatorColor={isProcessingPhase ? "bg-blue-500" : 
                                 isInsightPhase ? "bg-indigo-500" :
                                 isFinalizingPhase ? "bg-emerald-500" : 
                                 "bg-amber-500"}
                  showAnimation={isProcessingPhase}
                />
                <p className={`text-xs italic ${isProcessingPhase ? 'text-blue-600 font-medium' : 
                           isInsightPhase ? 'text-indigo-600' :
                           isFinalizingPhase ? 'text-emerald-600' :
                           'text-amber-600'}`}>
                  {isProcessingPhase ? 
                    "Claude AI is analyzing your website content. This may take up to 2 minutes..." : 
                   isInsightPhase ?
                    "Processing data and generating strategic insights..." :
                   isFinalizingPhase ?
                    "Preparing insights for display..." :
                    "Crawling website and extracting content..."}
                </p>
              </div>
              
              {/* Timeline indicators */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                <div className={`h-1 rounded-l ${progress >= 20 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                <div className={`h-1 ${progress >= 40 ? 'bg-blue-400' : 'bg-slate-200'}`}></div>
                <div className={`h-1 ${progress >= 70 ? 'bg-indigo-400' : 'bg-slate-200'}`}></div>
                <div className={`h-1 rounded-r ${progress >= 95 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500">
                <div className="text-left">Crawling</div>
                <div className="text-center">Processing</div>
                <div className="text-center">Analysis</div>
                <div className="text-right">Complete</div>
              </div>
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
