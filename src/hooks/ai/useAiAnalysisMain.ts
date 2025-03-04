
import { useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";

/**
 * Main hook for executing document analysis
 */
export const useAiAnalysisMain = (
  project: Project,
  generateProjectInsights: (documents: Document[], isRetry?: boolean) => Promise<boolean>,
  generateFallbackInsights: (documents: Document[]) => void,
  startProcessing: (onComplete?: (setActiveTab: (tab: string) => void) => void) => (setActiveTab: (tab: string) => void) => void,
  handleProcessingComplete: (setActiveTab: (tab: string) => void) => void
) => {
  // Main function to analyze documents
  const handleAnalyzeDocuments = useCallback(async (documents: Document[], setActiveTab: (tab: string) => void) => {
    // Start processing and get monitoring function
    const monitorProgress = startProcessing(handleProcessingComplete);
    
    // Start monitoring
    monitorProgress(setActiveTab);
    
    console.log("Starting document analysis with useRealAI set to:", true);
    
    // Try to generate insights
    const success = await generateProjectInsights(documents);
    
    // If generation failed, use fallback insights
    if (!success) {
      console.log("No insights returned, using mock generator as fallback");
      generateFallbackInsights(documents);
    }
  }, [generateProjectInsights, generateFallbackInsights, startProcessing, handleProcessingComplete]);

  return {
    handleAnalyzeDocuments
  };
};
