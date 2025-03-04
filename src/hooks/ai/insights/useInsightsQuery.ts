
import { useQuery } from "@tanstack/react-query";
import { StrategicInsight } from "@/lib/types";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";

/**
 * Hook for querying project insights from localStorage
 */
export const useInsightsQuery = (projectId: string) => {
  const { handleError } = useErrorHandler();
  
  // Query key for this project's insights
  const insightsQueryKey = ['project', projectId, 'insights'];

  // Load insights from localStorage
  const fetchInsights = async (): Promise<StrategicInsight[]> => {
    if (!projectId) return [];
    
    try {
      const storedData = localStorage.getItem(`project_insights_${projectId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log(`Loaded ${parsedData.insights.length} insights from storage for project ${projectId}`);
        return parsedData.insights;
      }
      return [];
    } catch (err) {
      const errorDetails = handleError(err, { context: 'loading-insights', projectId: projectId });
      throw new Error(errorDetails.message);
    }
  };

  // Query hook for insights
  const insightsQuery = useQuery({
    queryKey: insightsQueryKey,
    queryFn: fetchInsights,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  return {
    insightsQuery,
    insightsQueryKey
  };
};
