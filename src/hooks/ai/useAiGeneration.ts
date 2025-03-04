
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { prepareDocumentContents } from "@/services/ai/promptUtils";
import { callClaudeApi, createTimeoutPromise } from "@/services/ai/apiClient";

export const useAiGeneration = (
  project: Project,
  setInsights: (insights: StrategicInsight[], usingFallback: boolean) => void,
  setError: (error: string | null) => void,
  completeProcessing: (message: string) => void,
  setUsingFallbackInsights: (usingFallback: boolean) => void
) => {
  const [useRealAI, setUseRealAI] = useState<boolean>(true);
  const [insufficientContent, setInsufficientContent] = useState<boolean>(false);

  const generateProjectInsights = useCallback(
    async (documents: Document[], isRetry = false): Promise<boolean> => {
      console.log("Generating project insights, useRealAI:", useRealAI);
      
      if (!useRealAI) {
        console.log("Real AI disabled, skipping generation");
        return false;
      }

      try {
        console.log(`Generating insights with ${isRetry ? "retry" : "initial"} attempt for ${documents.length} documents`);
        
        if (documents.length === 0) {
          console.error("No documents provided for analysis");
          setError("No documents provided for analysis. Please upload documents first.");
          completeProcessing("Analysis failed - no documents");
          return false;
        }
        
        // Prepare document contents for analysis - now returns an array of objects
        const documentContents = prepareDocumentContents(documents);
        console.log(`Prepared ${documentContents.length} document contents for analysis`);
        console.log("Total content size:", documentContents.reduce((acc, doc) => acc + (doc.content?.length || 0), 0), "characters");
        
        // Add more detailed error handling for API call
        try {
          // Create the actual API call promise
          const result = await callClaudeApi(project, documents, documentContents);
          
          // Log detailed info about results
          console.log("API call result:", {
            hasInsights: result.insights && result.insights.length > 0,
            insightCount: result.insights?.length || 0,
            hasError: !!result.error,
            error: result.error,
            insufficientContent: result.insufficientContent
          });
          
          // Check if there was insufficient content
          if (result.insufficientContent) {
            setInsufficientContent(true);
            setError(result.error || "Insufficient document content for meaningful insights");
            completeProcessing("Analysis complete - insufficient content");
            return false;
          }
          
          if (result.insights && result.insights.length > 0) {
            // Determine if we are using fallback insights from the error
            const usingFallback = !!result.error && result.error.includes("using generated sample insights");
            
            // Set insights with appropriate fallback flag
            setInsights(result.insights, usingFallback);
            
            // If there's an error but we still got insights, it's likely fallback
            if (result.error) {
              setError(result.error);
              setUsingFallbackInsights(usingFallback);
            } else {
              setError(null);
              setUsingFallbackInsights(false);
            }
            
            completeProcessing("Analysis complete");
            return !usingFallback; // Return true only if we used real AI
          } else {
            setError("No insights were generated. Try uploading more detailed documents or using website analysis.");
            return false;
          }
        } catch (apiError) {
          console.error("API call error:", apiError);
          setError(`API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
          completeProcessing("Analysis failed - API error");
          return false;
        }
      } catch (err) {
        console.error("Error generating insights:", err);
        setError(`Error generating insights: ${err instanceof Error ? err.message : String(err)}`);
        completeProcessing("Analysis failed - error");
        return false;
      }
    },
    [project, useRealAI, setInsights, setError, completeProcessing, setUsingFallbackInsights]
  );

  return {
    useRealAI,
    setUseRealAI,
    generateProjectInsights,
    insufficientContent,
    setInsufficientContent
  };
};
