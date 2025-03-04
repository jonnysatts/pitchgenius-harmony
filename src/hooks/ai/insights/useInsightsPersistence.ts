
import { StoredInsightData, StrategicInsight } from "@/lib/types";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for persistence functions for insights
 */
export const useInsightsPersistence = (projectId: string) => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // Save insights to localStorage
  const persistInsights = async (insightData: {
    insights: StrategicInsight[],
    usingFallback?: boolean
  }): Promise<void> => {
    if (!projectId || !insightData.insights.length) return;
    
    try {
      const storageData: StoredInsightData = {
        projectId: projectId,
        insights: insightData.insights,
        generationTimestamp: Date.now(),
        usingFallbackData: !!insightData.usingFallback,
        timestamp: new Date().toISOString(),
        usingFallbackInsights: !!insightData.usingFallback
      };
      
      localStorage.setItem(`project_insights_${projectId}`, JSON.stringify(storageData));
      console.log(`Stored ${insightData.insights.length} insights for project ${projectId}`);
    } catch (err) {
      handleError(err, { context: 'persisting-insights', projectId: projectId });
      console.error('Error storing insights:', err);
      
      toast({
        title: "Failed to save insights",
        description: "Your insights couldn't be saved to local storage",
        variant: "destructive"
      });
    }
  };

  return {
    persistInsights
  };
};
