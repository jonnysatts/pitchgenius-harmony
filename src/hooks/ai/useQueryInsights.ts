
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StrategicInsight, Project } from '@/lib/types';
import { apiClient } from '@/services/api/apiClient';
import { useToast } from '@/hooks/use-toast';

/**
 * React Query hook for insights management
 */
export const useQueryInsights = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query to fetch insights
  const {
    data: insights = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['insights', projectId],
    queryFn: () => apiClient.insights.getInsightsForProject(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  });
  
  // Mutation to update an insight
  const updateInsightMutation = useMutation({
    mutationFn: ({ insightId, updatedContent }: { insightId: string, updatedContent: Record<string, any> }) => 
      apiClient.insights.updateInsight(projectId, insightId, updatedContent),
    onSuccess: () => {
      // Invalidate the insights query to refetch
      queryClient.invalidateQueries({ queryKey: ['insights', projectId] });
      toast({
        title: "Insight Updated",
        description: "The insight has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update insight: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Filter insights by source
  const documentInsights = insights.filter(insight => insight.source === 'document');
  const websiteInsights = insights.filter(insight => insight.source === 'website');
  
  // Group insights by category
  const groupInsightsByCategory = (insightsToGroup: StrategicInsight[]) => {
    const grouped: Record<string, StrategicInsight[]> = {};
    
    insightsToGroup.forEach(insight => {
      const category = insight.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(insight);
    });
    
    return grouped;
  };

  return {
    insights,
    documentInsights,
    websiteInsights,
    isLoading,
    error,
    refetch,
    updateInsight: updateInsightMutation.mutate,
    isUpdating: updateInsightMutation.isPending,
    groupInsightsByCategory
  };
};
