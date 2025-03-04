
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";
import { useInsightsPersistence } from "./useInsightsPersistence";

/**
 * Hook for all insight-related mutations
 */
export const useInsightsMutations = (projectId: string, insightsQueryKey: string[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { persistInsights } = useInsightsPersistence(projectId);

  // Mutation for adding new insights
  const addInsightsMutation = useMutation({
    mutationFn: async (newInsights: StrategicInsight[]) => {
      if (!newInsights || newInsights.length === 0) {
        console.warn('No new insights to add');
        toast({
          title: "No insights generated",
          description: "The analysis completed but no insights were generated.",
          variant: "destructive"
        });
        return queryClient.getQueryData<StrategicInsight[]>(insightsQueryKey) || [];
      }
      
      const currentInsights = queryClient.getQueryData<StrategicInsight[]>(insightsQueryKey) || [];
      let updatedInsights: StrategicInsight[] = [];
      
      // For website insights, remove existing website insights
      if (newInsights.some(insight => insight.source === 'website')) {
        console.log('Found website insights, replacing all existing website insights');
        
        // Filter out existing website insights
        const nonWebsiteInsights = currentInsights.filter(
          insight => insight.source !== 'website'
        );
        
        // Combine with new website insights
        updatedInsights = [...nonWebsiteInsights, ...newInsights];
        
        // Show toast
        toast({
          title: "Website insights added",
          description: `${newInsights.length} website insights are now available.`,
          variant: "default"
        });
      } else {
        // For document insights, avoid duplicates based on content.title
        const existingTitles = new Set(currentInsights.map(insight => 
          insight.content && insight.content.title ? insight.content.title : ''
        ));
        
        const filteredNewInsights = newInsights.filter(insight => 
          insight.content && insight.content.title && !existingTitles.has(insight.content.title)
        );
        
        if (filteredNewInsights.length === 0) {
          console.warn('All new insights are duplicates of existing ones');
          toast({
            title: "No new insights",
            description: "All insights were duplicates of existing ones.",
            variant: "default"
          });
          return currentInsights;
        }
        
        // Combine existing and new insights
        updatedInsights = [...currentInsights, ...filteredNewInsights];
        
        // Show toast
        toast({
          title: "Document insights added",
          description: `${filteredNewInsights.length} document insights added.`,
          variant: "default"
        });
      }
      
      // Return the updated insights
      return updatedInsights;
    },
    onSuccess: (updatedInsights) => {
      // Persist to localStorage
      persistInsights({ insights: updatedInsights });
      
      // Update the query cache
      queryClient.setQueryData(insightsQueryKey, updatedInsights);
    },
    onError: (error) => {
      handleError(error, { context: 'adding-insights', projectId: projectId });
      toast({
        title: "Failed to add insights",
        description: "There was an error adding new insights",
        variant: "destructive"
      });
    }
  });

  // Mutation for setting entirely new insights
  const setInsightsMutation = useMutation({
    mutationFn: async ({ insights, usingFallback = false }: { 
      insights: StrategicInsight[],
      usingFallback?: boolean
    }) => {
      return insights;
    },
    onSuccess: (newInsights, { usingFallback }) => {
      // Persist to localStorage
      persistInsights({ insights: newInsights, usingFallback });
      
      // Update the query cache
      queryClient.setQueryData(insightsQueryKey, newInsights);
      
      // Show a toast notification
      if (newInsights.length > 0) {
        toast({
          title: `${usingFallback ? "Sample" : "New"} insights added`,
          description: `${newInsights.length} insights are now available for review.`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      handleError(error, { context: 'setting-insights', projectId: projectId });
      toast({
        title: "Failed to update insights",
        description: "There was an error updating insights",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating a single insight
  const updateInsightMutation = useMutation({
    mutationFn: async ({ 
      insightId, 
      updates 
    }: { 
      insightId: string,
      updates: Partial<StrategicInsight>
    }) => {
      const currentInsights = queryClient.getQueryData<StrategicInsight[]>(insightsQueryKey) || [];
      
      return currentInsights.map(insight => 
        insight.id === insightId 
          ? { ...insight, ...updates } 
          : insight
      );
    },
    onSuccess: (updatedInsights) => {
      // Persist to localStorage
      persistInsights({ insights: updatedInsights });
      
      // Update the query cache
      queryClient.setQueryData(insightsQueryKey, updatedInsights);
    },
    onError: (error) => {
      handleError(error, { context: 'updating-insight', projectId: projectId });
      toast({
        title: "Failed to update insight",
        description: "There was an error updating the insight",
        variant: "destructive"
      });
    }
  });

  return {
    addInsightsMutation,
    setInsightsMutation,
    updateInsightMutation
  };
};
