
import React, { useEffect } from 'react';
import { Project, AIProcessingStatus } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import {
  AnalysisProgressIndicator,
  AnalysisStatusAlert,
  AnalysisPhaseTimeline
} from './analysis-controls';
import { toast } from 'sonner';

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
  const [analysisCompleted, setAnalysisCompleted] = React.useState(false);
  
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
      setAnalysisCompleted(false);
      
      interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev < 15) {
            setStatusMessage('Connecting to Firecrawl API...');
            return prev + 5; // Faster initial progress
          } else if (prev < 30) {
            setStatusMessage('Crawling website content...');
            return prev + 2; // Medium progress
          } else if (prev < 50) {
            setStatusMessage('Extracting text from website...');
            return prev + 1.5; // Slower
          } else if (prev < 70) {
            setStatusMessage('Claude AI is analyzing content...');
            return prev + 1.0; // Even slower
          } else if (prev < 90) {
            setStatusMessage('Generating strategic insights...');
            return prev + 0.5; // Very slow at the end
          } else if (prev < 100) {
            setStatusMessage('Finalizing analysis...');
            return prev + 0.2; // Barely moving at the very end
          }
          return prev;
        });
      }, 200); // Update more frequently
    } else if (!isAnalyzing) {
      // Check if we just completed an analysis
      if (internalProgress > 90 && !analysisCompleted) {
        setAnalysisCompleted(true);
        
        // Show toast notification when analysis completes
        toast.success("Analysis Complete", {
          description: "Website insights are now available for review"
        });
      }
      
      // Reset progress if not a completion
      if (internalProgress === 0) {
        setStatusMessage('');
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, aiStatus, internalProgress, analysisCompleted]);

  // Only show controls when we're analyzing
  if (!isAnalyzing) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
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
                {error.includes("demo") && (
                  <p className="text-xs mt-1 italic">
                    Using the Firecrawl API and Claude AI to extract and analyze website content.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
