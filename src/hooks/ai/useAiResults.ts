
import { useCallback } from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { toast } from "sonner";
import { useQueryInsights } from "./insights";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";

export const useAiResults = (project: Project) => {
  const { handleError } = useErrorHandler();
  
  // Use the query insights hook to manage insights state
  const {
    insights,
    error,
    setInsights: setPersistentInsights,
    addInsights,
    isLoading,
    refetchInsights
  } = useQueryInsights(project);

  // Show completion toast based on insight generation results
  const handleCompletionToast = useCallback((usingFallbackInsights: boolean) => {
    if (!insights || insights.length === 0) {
      console.log('No insights to show completion toast for');
      return;
    }
    
    if (usingFallbackInsights) {
      toast.info("Analysis complete (with fallback)", {
        description: `Generated ${insights.length} sample insights due to API timeout`
      });
    } else {
      toast.success("Analysis complete", {
        description: `Generated ${insights.length} strategic insights`
      });
    }
    
    console.log(`Displayed completion toast for ${insights.length} insights (fallback: ${usingFallbackInsights})`);
  }, [insights]);

  return {
    insights,
    setInsights: setPersistentInsights,
    error,
    isLoading,
    refetchInsights,
    setError: () => {}, // Handled by React Query now
    handleCompletionToast,
    persistInsights: (insights: StrategicInsight[], usingFallback = false) => 
      setPersistentInsights(insights, usingFallback),
    addInsights
  };
};
