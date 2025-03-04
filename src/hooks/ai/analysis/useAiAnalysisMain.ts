
import { useCallback } from "react";
import { Project, Document } from "@/lib/types";
import { useAnalysisPreparation } from "./useAnalysisPreparation";
import { useDirectAnalysis } from "./useDirectAnalysis";
import { useFallbackAnalysis } from "./useFallbackAnalysis";

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
  const { prepareAnalysisStart, handleAnalysisSuccess, handleAnalysisError } = useAnalysisPreparation();
  const { performDirectAnalysis } = useDirectAnalysis(project);
  const { executeFallbackAnalysis } = useFallbackAnalysis();

  // Main function to analyze documents
  const handleAnalyzeDocuments = useCallback(async (documents: Document[], setActiveTab: (tab: string) => void) => {
    // Initialize the analysis process
    prepareAnalysisStart(documents, setActiveTab, startProcessing, handleProcessingComplete);
    
    try {
      // First try direct analysis
      const directAnalysisResult = await performDirectAnalysis(documents);
      
      // If direct analysis succeeded, return true
      if (directAnalysisResult.success && directAnalysisResult.extractedInsights) {
        return true;
      }
      
      console.log("Direct analysis did not produce usable insights, falling back to previous method");
      
      // If direct analysis failed or returned no insights, try the previous method
      const success = await generateProjectInsights(documents);
      
      // If generation failed, use fallback insights
      if (!success) {
        return executeFallbackAnalysis(documents, generateFallbackInsights);
      }
      
      return handleAnalysisSuccess(0); // We don't know how many insights were generated
    } catch (error) {
      console.error("Error in document analysis:", error);
      // If anything fails, try to generate fallback insights
      return executeFallbackAnalysis(documents, generateFallbackInsights);
    }
  }, [
    prepareAnalysisStart,
    performDirectAnalysis,
    generateProjectInsights,
    executeFallbackAnalysis,
    generateFallbackInsights,
    startProcessing,
    handleProcessingComplete,
    handleAnalysisSuccess
  ]);

  return {
    handleAnalyzeDocuments
  };
};
