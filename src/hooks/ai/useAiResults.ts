
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useAiResults = (project: Project) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    setInsights,
    error,
    setError,
    handleCompletionToast
  };
};
