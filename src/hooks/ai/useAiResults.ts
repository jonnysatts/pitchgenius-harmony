
import { useCallback } from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useQueryInsights } from "./insights";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";

export const useAiResults = (project: Project) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  // Use the query insights hook to manage insights state
  const {
    insights,
    error,
    setInsights: setPersistentInsights,
    addInsights,
    isLoading
  } = useQueryInsights(project);

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
    isLoading,
    setError: () => {}, // Handled by React Query now
    handleCompletionToast,
    persistInsights: (insights: StrategicInsight[], usingFallback = false) => 
      setPersistentInsights(insights, usingFallback),
    addInsights
  };
};
