import { StoredInsightData, StrategicInsight } from "@/lib/types";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for persistence functions for insights
 */
export const useInsightsPersistence = (projectId: string) => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // Load insights from localStorage
  const loadInsights = (): StrategicInsight[] => {
    if (!projectId) return [];
    
    try {
      const storageKey = `project_insights_${projectId}`;
      const storedDataJson = localStorage.getItem(storageKey);
      
      if (storedDataJson) {
        const storedData = JSON.parse(storedDataJson);
        if (storedData && Array.isArray(storedData.insights)) {
          console.log(`Loaded ${storedData.insights.length} insights from localStorage for project ${projectId}`);
          return storedData.insights;
        }
      }
      return [];
    } catch (err) {
      console.error('Error loading insights from localStorage:', err);
      return [];
    }
  };

  // Check if insights already exist in localStorage
  const insightsExist = (): boolean => {
    if (!projectId) return false;
    
    try {
      const storageKey = `project_insights_${projectId}`;
      const storedDataJson = localStorage.getItem(storageKey);
      
      if (storedDataJson) {
        const storedData = JSON.parse(storedDataJson);
        return storedData && Array.isArray(storedData.insights) && storedData.insights.length > 0;
      }
      return false;
    } catch (err) {
      console.error('Error checking insights existence:', err);
      return false;
    }
  };

  // Save insights to localStorage, properly handling multiple sources
  const persistInsights = async (insightData: {
    insights: StrategicInsight[],
    usingFallback?: boolean,
    replaceExisting?: boolean
  }): Promise<void> => {
    if (!projectId || !insightData.insights.length) return;
    
    try {
      // If replaceExisting is true, simply replace all insights
      if (insightData.replaceExisting) {
        const storageData: StoredInsightData = {
          projectId: projectId,
          insights: insightData.insights,
          generationTimestamp: Date.now(),
          usingFallbackData: !!insightData.usingFallback,
          timestamp: new Date().toISOString(),
          usingFallbackInsights: !!insightData.usingFallback
        };
        
        localStorage.setItem(`project_insights_${projectId}`, JSON.stringify(storageData));
        console.log(`Stored ${insightData.insights.length} insights for project ${projectId} (replaced existing)`);
        return;
      }
      
      // Otherwise, intelligently merge based on source
      const existingInsights = loadInsights();
      
      // Determine insight sources in the new dataset
      const newInsightSources = Array.from(
        new Set(insightData.insights.map(insight => insight.source || 'document'))
      );
      
      let updatedInsights: StrategicInsight[] = [];
      
      // Handle the different source scenarios
      if (newInsightSources.length === 1) {
        const newSource = newInsightSources[0];
        
        // Keep existing insights from other sources
        const existingOtherSourceInsights = existingInsights.filter(
          insight => (insight.source || 'document') !== newSource
        );
        
        // Combine other source insights with new insights of this source
        updatedInsights = [...existingOtherSourceInsights, ...insightData.insights];
        
        console.log(`Updated insights by source: kept ${existingOtherSourceInsights.length} existing insights with different source, added ${insightData.insights.length} new insights with source '${newSource}'`);
      } else {
        // If we have mixed sources in the new dataset, determine the best merge strategy
        // For now, just append the new insights, avoiding duplicates by ID
        const existingIds = new Set(existingInsights.map(insight => insight.id));
        const newUniqueInsights = insightData.insights.filter(insight => !existingIds.has(insight.id));
        
        updatedInsights = [...existingInsights, ...newUniqueInsights];
        console.log(`Added ${newUniqueInsights.length} unique new insights to ${existingInsights.length} existing insights`);
      }
      
      const storageData: StoredInsightData = {
        projectId: projectId,
        insights: updatedInsights,
        generationTimestamp: Date.now(),
        usingFallbackData: !!insightData.usingFallback,
        timestamp: new Date().toISOString(),
        usingFallbackInsights: !!insightData.usingFallback
      };
      
      localStorage.setItem(`project_insights_${projectId}`, JSON.stringify(storageData));
      console.log(`Stored total of ${updatedInsights.length} insights for project ${projectId}`);
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

  // Clear all insights for a project
  const clearInsights = (): void => {
    if (!projectId) return;
    
    try {
      localStorage.removeItem(`project_insights_${projectId}`);
      console.log(`Cleared insights from storage for project ${projectId}`);
    } catch (err) {
      console.error('Error clearing insights from localStorage:', err);
    }
  };

  return {
    persistInsights,
    loadInsights,
    insightsExist,
    clearInsights
  };
};
