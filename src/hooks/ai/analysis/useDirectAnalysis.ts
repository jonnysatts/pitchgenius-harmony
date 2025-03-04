
import { useCallback } from "react";
import { Document, Project } from "@/lib/types";
import { analyzeDocuments, extractInsightsFromAnalysis } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for direct document analysis with Claude
 */
export const useDirectAnalysis = (project: Project) => {
  const { toast } = useToast();

  const performDirectAnalysis = useCallback(async (documents: Document[]) => {
    console.log("Attempting direct document analysis with Claude");
    
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
          return { success: true, extractedInsights };
        }
      }
      
      console.log("Direct analysis did not produce usable insights, falling back to previous method");
      return { success: false, extractedInsights: null };
    } catch (error) {
      console.error("Error in direct document analysis:", error);
      return { success: false, extractedInsights: null, error };
    }
  }, [project.id, toast]);

  return {
    performDirectAnalysis
  };
};
