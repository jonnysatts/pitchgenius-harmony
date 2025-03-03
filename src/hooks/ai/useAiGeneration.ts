
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { generateInsights } from "@/services/ai";

export const useAiGeneration = (
  project: Project,
  setInsights: (insights: StrategicInsight[], usingFallback: boolean) => void,
  setError: (error: string | null) => void,
  completeProcessing: (message: string) => void,
  setUsingFallbackInsights: (usingFallback: boolean) => void
) => {
  const [useRealAI, setUseRealAI] = useState<boolean>(false);

  const generateProjectInsights = useCallback(
    async (documents: Document[], isRetry = false): Promise<boolean> => {
      if (!useRealAI) {
        console.log("Real AI disabled, skipping generation");
        return false;
      }

      try {
        console.log(`Generating insights with ${isRetry ? "retry" : "initial"} attempt`);
        const result = await generateInsights(project, documents);
        
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
          setError("No insights were generated. Using mock insights instead.");
          return false;
        }
      } catch (err) {
        console.error("Error generating insights:", err);
        setError(`Error generating insights: ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    },
    [project, useRealAI, setInsights, setError, completeProcessing, setUsingFallbackInsights]
  );

  return {
    useRealAI,
    setUseRealAI,
    generateProjectInsights,
  };
};
