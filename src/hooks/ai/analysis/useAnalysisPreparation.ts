
import { useCallback } from "react";
import { Document } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook for preparation logic before starting analysis
 */
export const useAnalysisPreparation = () => {
  const prepareAnalysisStart = useCallback((
    documents: Document[],
    setActiveTab: (tab: string) => void,
    startProcessing: (onComplete?: (setActiveTab: (tab: string) => void) => void) => (setActiveTab: (tab: string) => void) => void,
    handleProcessingComplete: (setActiveTab: (tab: string) => void) => void
  ) => {
    console.log("Starting document analysis with documents:", documents.length);
    
    // Show only one toast notification using Sonner
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
    // Use Sonner toast for success message
    toast.success("Analysis completed", {
      description: `Generated ${numInsights} insights from your documents.`
    });
    
    console.log(`Analysis success: ${numInsights} insights generated`);
    return true;
  }, []);

  const handleAnalysisError = useCallback(() => {
    // Use Sonner toast for error message
    toast.error("Analysis error", {
      description: "An error occurred. Using fallback insights instead."
    });
    
    console.log("Analysis failed, using fallback insights");
    return false;
  }, []);

  return {
    prepareAnalysisStart,
    handleAnalysisSuccess,
    handleAnalysisError
  };
};
