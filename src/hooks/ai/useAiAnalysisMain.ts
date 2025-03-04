
import { useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { analyzeDocuments, extractInsightsFromAnalysis } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Main function to analyze documents
  const handleAnalyzeDocuments = useCallback(async (documents: Document[], setActiveTab: (tab: string) => void) => {
    // Start processing and get monitoring function
    const monitorProgress = startProcessing(handleProcessingComplete);
    
    // Start monitoring
    monitorProgress(setActiveTab);
    
    console.log("Starting document analysis with documents:", documents.length);
    
    try {
      // First attempt to directly analyze the documents
      const analysisResult = await analyzeDocuments(documents, project.id);
      console.log("Document analysis result:", analysisResult);
      
      if (analysisResult.success && analysisResult.analysisResults) {
        // If we have analysis results, convert them to insights
        const extractedInsights = extractInsightsFromAnalysis(analysisResult.analysisResults);
        console.log("Extracted insights:", extractedInsights);
        
        if (extractedInsights && extractedInsights.length > 0) {
          // We have successfully generated insights directly
          console.log(`Generated ${extractedInsights.length} insights directly from document analysis`);
          toast({
            title: "Analysis Completed",
            description: `Generated ${extractedInsights.length} insights from your documents.`,
            variant: "default"
          });
          return true;
        }
      }
      
      console.log("Direct analysis did not produce usable insights, falling back to previous method");
      
      // If direct analysis failed or returned no insights, try the previous method
      const success = await generateProjectInsights(documents);
      
      // If generation failed, use fallback insights
      if (!success) {
        console.log("No insights returned from previous method, using mock generator as fallback");
        generateFallbackInsights(documents);
        toast({
          title: "Analysis Complete",
          description: "Using fallback insights due to processing issues.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "Successfully generated insights from your documents.",
          variant: "default"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in document analysis:", error);
      // If anything fails, try to generate fallback insights
      generateFallbackInsights(documents);
      toast({
        title: "Analysis Error",
        description: "An error occurred. Using fallback insights instead.",
        variant: "destructive"
      });
      return false;
    }
  }, [generateProjectInsights, generateFallbackInsights, startProcessing, handleProcessingComplete, project.id, toast]);

  return {
    handleAnalyzeDocuments
  };
};
