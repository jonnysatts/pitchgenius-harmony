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

  // Save insights to localStorage
  const persistInsights = async (insightData: {
    insights: StrategicInsight[],
    usingFallback?: boolean
  }): Promise<void> => {
    if (!projectId || !insightData.insights.length) return;
    
    try {
      // Check for existing insights with different source (website vs document)
      const existingInsights = loadInsights();
      let updatedInsights = [...insightData.insights];
      
      // If we're adding new document insights
      if (insightData.insights.some(insight => insight.source !== 'website')) {
        // Keep existing website insights if any
        const existingWebsiteInsights = existingInsights.filter(
          insight => insight.source === 'website'
        );
        
        // Filter out existing document insights
        const newDocumentInsights = insightData.insights.filter(
          insight => insight.source !== 'website'
        );
        
        // Combine website and new document insights
        updatedInsights = [...existingWebsiteInsights, ...newDocumentInsights];
      } 
      // If we're adding website insights
      else if (insightData.insights.some(insight => insight.source === 'website')) {
        // Keep existing document insights if any
        const existingDocumentInsights = existingInsights.filter(
          insight => insight.source !== 'website'
        );
        
        // Get new website insights
        const newWebsiteInsights = insightData.insights.filter(
          insight => insight.source === 'website'
        );
        
        // Combine document and new website insights
        updatedInsights = [...existingDocumentInsights, ...newWebsiteInsights];
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
      console.log(`Stored ${updatedInsights.length} insights for project ${projectId}`);
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
