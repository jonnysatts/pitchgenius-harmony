
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { generateComprehensiveInsights } from "@/services/ai/mockGenerators/insightFactory";

export const useFallbackInsights = (
  project: Project,
  isAnalysisInProgress: boolean,
  currentInsights: StrategicInsight[],
  setInsights: (insights: StrategicInsight[], usingFallback: boolean) => void
) => {
  const [usingFallbackInsights, setUsingFallbackInsights] = useState<boolean>(false);

  const generateFallbackInsights = useCallback(
    (documents: Document[]) => {
      if (!isAnalysisInProgress) return;

      console.log("Generating fallback insights for project", project.id);
      const mockInsights = generateComprehensiveInsights(project, documents);
      
      // Set insights with fallback flag to true
      setInsights(mockInsights, true);
      setUsingFallbackInsights(true);
    },
    [project, isAnalysisInProgress, setInsights]
  );

  return {
    usingFallbackInsights,
    setUsingFallbackInsights,
    generateFallbackInsights,
  };
};
