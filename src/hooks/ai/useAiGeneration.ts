
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
        
        // Create a promise that will resolve with fallback insights after timeout
        const timeoutPromise = createTimeoutPromise(project, documents);
        
        // Create the actual API call promise
        const apiPromise = callClaudeApi(project, documents, documentContents);
        
        // Race the promises - whichever resolves first will be used
        const result = await Promise.race([apiPromise, timeoutPromise]);
        
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
