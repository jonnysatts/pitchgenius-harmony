
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
    
    // Show only one toast notification
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
    // Use only one toast system for success (preferring sonner)
    toast.success("Analysis completed", {
      description: `Generated ${numInsights} insights from your documents.`
    });
    
    return true;
  }, [uiToast]);

  const handleAnalysisError = useCallback(() => {
    // Use only one toast system for errors (preferring sonner)
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
