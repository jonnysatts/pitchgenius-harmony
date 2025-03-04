
import { useState } from "react";
import { AIProcessingStatus } from "@/lib/types";
import { monitorAIProcessingProgress, monitorWebsiteAnalysisProgress } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useAiStatus = (projectId: string) => {
  const { toast } = useToast();
  const [aiStatus, setAiStatus] = useState<AIProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze documents'
  });
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false);
  const [isWebsiteAnalysisInProgress, setIsWebsiteAnalysisInProgress] = useState(false);

  const startProcessing = (onComplete?: (setActiveTab: (tab: string) => void) => void) => {
    // Reset status
    setProcessingComplete(false);
    setIsAnalysisInProgress(true);
    
    // Update status to processing
    setAiStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting document analysis...'
    });
    
    return (setActiveTab: (tab: string) => void) => {
      // Set up progress monitoring with completion callback
      return monitorAIProcessingProgress(
        projectId,
        (status) => setAiStatus(status),
        () => {
          console.log("AI processing complete, navigating to insights tab");
          setProcessingComplete(true);
          setIsAnalysisInProgress(false);
          
          // Navigate to insights tab
          setActiveTab("insights");
          
          // Call additional completion callback if provided
          if (onComplete) {
            onComplete(setActiveTab);
          }
        }
      );
    };
  };

  const startWebsiteAnalysis = (onComplete?: (setActiveTab: (tab: string) => void) => void) => {
    // Reset status for website analysis
    setProcessingComplete(false);
    setIsWebsiteAnalysisInProgress(true);
    
    // Update status to processing
    setAiStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting website analysis...'
    });
    
    return (setActiveTab: (tab: string) => void) => {
      // Set up website progress monitoring with completion callback
      return monitorWebsiteAnalysisProgress(
        projectId,
        (status) => setAiStatus(status),
        () => {
          console.log("Website analysis complete, navigating to web insights tab");
          setProcessingComplete(true);
          setIsWebsiteAnalysisInProgress(false);
          
          // Navigate to web insights tab
          setActiveTab("webinsights");
          
          // Call additional completion callback if provided
          if (onComplete) {
            onComplete(setActiveTab);
          }
        }
      );
    };
  };

  const completeProcessing = (message: string) => {
    setAiStatus({
      status: 'completed',
      progress: 100,
      message
    });
    setProcessingComplete(true);
    setIsAnalysisInProgress(false);
    setIsWebsiteAnalysisInProgress(false);
  };

  return {
    aiStatus,
    processingComplete,
    isAnalysisInProgress,
    isWebsiteAnalysisInProgress,
    startProcessing,
    startWebsiteAnalysis,
    completeProcessing,
    setAiStatus
  };
};
