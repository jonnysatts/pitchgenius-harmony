
import { Project, StrategicInsight } from "@/lib/types";
import { useInsightsQuery } from "./useInsightsQuery";
import { useInsightsMutations } from "./useInsightsMutations";

/**
 * Provides query and mutation functions for managing insights
 */
export const useQueryInsights = (project: Project) => {
  const projectId = project.id;
  
  // Get the query functionality
  const { insightsQuery, insightsQueryKey } = useInsightsQuery(projectId);
  
  // Get the mutations
  const {
    addInsightsMutation,
    setInsightsMutation,
    updateInsightMutation
  } = useInsightsMutations(projectId, insightsQueryKey);

  return {
    // Queries
    insights: insightsQuery.data || [],
    isLoading: insightsQuery.isLoading,
    error: insightsQuery.error,
    
    // Mutations
    addInsights: (newInsights: StrategicInsight[]) => 
      addInsightsMutation.mutate(newInsights),
    setInsights: (insights: StrategicInsight[], usingFallback = false) => 
      setInsightsMutation.mutate({ insights, usingFallback }),
    updateInsight: (insightId: string, updates: Partial<StrategicInsight>) => 
      updateInsightMutation.mutate({ insightId, updates }),
      
    // Status
    isAddingInsights: addInsightsMutation.isPending,
    isSettingInsights: setInsightsMutation.isPending,
    isUpdatingInsight: updateInsightMutation.isPending
  };
};
