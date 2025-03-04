
import React, { useEffect } from 'react';
import { Project, AIProcessingStatus } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import {
  AnalysisProgressIndicator,
  AnalysisStatusAlert,
  AnalysisPhaseTimeline
} from './analysis-controls';

interface WebsiteAnalysisControlsProps {
  project: Project;
  isAnalyzing: boolean;
  onAnalyzeWebsite: () => void;
  hasInsights: boolean;
  aiStatus?: AIProcessingStatus;
  error?: string | null;
}

export const WebsiteAnalysisControls: React.FC<WebsiteAnalysisControlsProps> = ({
  project,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights,
  aiStatus,
  error
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
            return prev + 3; // Faster initial progress
          } else if (prev < 40) {
            setStatusMessage('Crawling website pages...');
            return prev + 1.5; // Faster mid progress
          } else if (prev < 60) {
            setStatusMessage('Claude AI is analyzing website data...');
            return prev + 0.6; // Double the previous speed
          } else if (prev < 80) {
            setStatusMessage('Generating strategic insights...');
            return prev + 1.0; // Slightly faster
          } else if (prev < 95) {
            setStatusMessage('Finalizing analysis...');
            return prev + 0.8; // Faster finishing
          } else if (prev < 100) {
            setStatusMessage('Completing analysis...');
            return prev + 0.4; // Double the previous speed
          }
          return prev;
        });
      }, 250); // Slightly faster updates
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
      setInternalProgress(0);
      
      if (!aiStatus) {
        toast({
          title: "Analysis Complete",
          description: "Website insights are now available",
        });
      }
    }
  }, [isAnalyzing, internalProgress, aiStatus]);

  // Only show controls when we're analyzing
  if (!isAnalyzing) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasWebsiteUrl && (
        <div className="flex flex-col space-y-4">
          <div className="space-y-3">
            {/* Analysis status alert */}
            <AnalysisStatusAlert 
              isProcessingPhase={isProcessingPhase}
              isInsightPhase={isInsightPhase}
              isFinalizingPhase={isFinalizingPhase}
              message={message}
            />
            
            {/* Progress bar with phase indication */}
            <AnalysisProgressIndicator 
              progress={progress}
              isProcessingPhase={isProcessingPhase}
              isInsightPhase={isInsightPhase}
              isFinalizingPhase={isFinalizingPhase}
              message={message}
            />
            
            {/* Timeline indicators */}
            <AnalysisPhaseTimeline progress={progress} />
            
            {/* Error message if any */}
            {error && (
              <div className="mt-4 p-3 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                <p className="text-sm font-medium">
                  <span className="font-bold">Note:</span> {error}
                </p>
                <p className="text-xs mt-1 italic">
                  For demonstration purposes, sample insights will be shown instead of actual analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
