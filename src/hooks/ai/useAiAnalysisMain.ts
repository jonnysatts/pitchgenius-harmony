
import { useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { analyzeDocuments, extractInsightsFromAnalysis } from "@/services/ai";

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
    
    try {
      // First attempt to directly analyze the documents
      const analysisResult = await analyzeDocuments(documents, project.id);
      console.log("Document analysis result:", analysisResult);
      
      if (analysisResult.success && analysisResult.analysisResults) {
        // If we have analysis results, convert them to insights
        const extractedInsights = extractInsightsFromAnalysis(analysisResult.analysisResults);
        if (extractedInsights && extractedInsights.length > 0) {
          // We have successfully generated insights directly
          console.log(`Generated ${extractedInsights.length} insights directly from document analysis`);
          return true;
        }
      }
      
      // If direct analysis failed or returned no insights, try the previous method
      const success = await generateProjectInsights(documents);
      
      // If generation failed, use fallback insights
      if (!success) {
        console.log("No insights returned, using mock generator as fallback");
        generateFallbackInsights(documents);
      }
      
      return success;
    } catch (error) {
      console.error("Error in document analysis:", error);
      // If anything fails, try to generate fallback insights
      generateFallbackInsights(documents);
      return false;
    }
  }, [generateProjectInsights, generateFallbackInsights, startProcessing, handleProcessingComplete, project.id]);

  return {
    handleAnalyzeDocuments
  };
};
