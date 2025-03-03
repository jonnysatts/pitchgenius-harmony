
import { useState, useCallback, useEffect } from "react";
import { Project, Document, StrategicInsight, StoredInsightData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useAiResults = (project: Project) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load insights from storage on initial mount
  useEffect(() => {
    if (project?.id) {
      const storedData = localStorage.getItem(`project_insights_${project.id}`);
      if (storedData) {
        try {
          const parsedData: StoredInsightData = JSON.parse(storedData);
          setInsights(parsedData.insights);
          console.log(`Loaded ${parsedData.insights.length} insights from storage for project ${project.id}`);
        } catch (err) {
          console.error('Error parsing stored insights:', err);
        }
      }
    }
  }, [project.id]);

  // Persist insights whenever they change
  const persistInsights = useCallback((newInsights: StrategicInsight[], usingFallback: boolean = false) => {
    if (project?.id && newInsights.length > 0) {
      const storageData: StoredInsightData = {
        projectId: project.id,
        insights: newInsights,
        timestamp: new Date().toISOString(),
        usingFallbackInsights: usingFallback
      };
      
      localStorage.setItem(`project_insights_${project.id}`, JSON.stringify(storageData));
      console.log(`Stored ${newInsights.length} insights for project ${project.id}`);
    }
  }, [project.id]);

  // Enhanced setInsights that also persists
  const setPersistentInsights = useCallback((newInsights: StrategicInsight[], usingFallback: boolean = false) => {
    setInsights(newInsights);
    persistInsights(newInsights, usingFallback);
  }, [persistInsights]);

  // Show completion toast based on insight generation results
  const handleCompletionToast = useCallback((usingFallbackInsights: boolean) => {
    if (insights.length > 0) {
      if (usingFallbackInsights) {
        toast({
          title: "Analysis complete (with fallback)",
          description: `Generated ${insights.length} sample insights due to API timeout`,
          variant: "default"
        });
      } else {
        toast({
          title: "Analysis complete",
          description: `Generated ${insights.length} strategic insights`,
        });
      }
    }
  }, [insights.length, toast]);

  return {
    insights,
    setInsights: setPersistentInsights,
    error,
    setError,
    handleCompletionToast,
    persistInsights
  };
};
