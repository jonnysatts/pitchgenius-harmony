
import { useCallback } from "react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

/**
 * Hook for preparation logic before starting analysis
 */
export const useAnalysisPreparation = () => {
  const { toast: uiToast } = useToast();

  const prepareAnalysisStart = useCallback((
    documents: Document[],
    setActiveTab: (tab: string) => void,
    startProcessing: (onComplete?: (setActiveTab: (tab: string) => void) => void) => (setActiveTab: (tab: string) => void) => void,
    handleProcessingComplete: (setActiveTab: (tab: string) => void) => void
  ) => {
    console.log("Starting document analysis with documents:", documents.length);
    
    // Show toast notification
    toast.info("Analysis started", {
      description: "Your documents are being analyzed. You'll be redirected to see the progress."
    });
    
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
    uiToast({
      title: "Analysis Completed",
      description: `Generated ${numInsights} insights from your documents.`,
      variant: "default"
    });
    
    // Also show in the newer toast system
    toast.success("Analysis completed", {
      description: `Generated ${numInsights} insights from your documents.`
    });
    
    return true;
  }, [uiToast]);

  const handleAnalysisError = useCallback(() => {
    uiToast({
      title: "Analysis Error",
      description: "An error occurred. Using fallback insights instead.",
      variant: "destructive"
    });
    
    // Also show in the newer toast system
    toast.error("Analysis error", {
      description: "An error occurred. Using fallback insights instead."
    });
    
    return false;
  }, [uiToast]);

  return {
    prepareAnalysisStart,
    handleAnalysisSuccess,
    handleAnalysisError
  };
};
