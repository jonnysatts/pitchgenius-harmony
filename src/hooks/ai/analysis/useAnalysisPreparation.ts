
import { useCallback } from "react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for preparation logic before starting analysis
 */
export const useAnalysisPreparation = () => {
  const { toast } = useToast();

  const prepareAnalysisStart = useCallback((
    documents: Document[],
    setActiveTab: (tab: string) => void,
    startProcessing: (onComplete?: (setActiveTab: (tab: string) => void) => void) => (setActiveTab: (tab: string) => void) => void,
    handleProcessingComplete: (setActiveTab: (tab: string) => void) => void
  ) => {
    console.log("Starting document analysis with documents:", documents.length);
    
    // Start processing and get monitoring function
    const monitorProgress = startProcessing(handleProcessingComplete);
    
    // Start monitoring
    monitorProgress(setActiveTab);
    
    // Immediately navigate to insights tab to show progress
    setTimeout(() => {
      setActiveTab("insights");
    }, 300);
    
    return { monitorProgress };
  }, []);

  const handleAnalysisSuccess = useCallback((numInsights: number) => {
    toast({
      title: "Analysis Completed",
      description: `Generated ${numInsights} insights from your documents.`,
      variant: "default"
    });
    return true;
  }, [toast]);

  const handleAnalysisError = useCallback(() => {
    toast({
      title: "Analysis Error",
      description: "An error occurred. Using fallback insights instead.",
      variant: "destructive"
    });
    return false;
  }, [toast]);

  return {
    prepareAnalysisStart,
    handleAnalysisSuccess,
    handleAnalysisError
  };
};
