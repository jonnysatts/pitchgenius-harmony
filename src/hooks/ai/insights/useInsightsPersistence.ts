import { StoredInsightData, StrategicInsight } from "@/lib/types";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

/**
 * Hook for persistence functions for insights
 */
export const useInsightsPersistence = (projectId: string) => {
  const { handleError } = useErrorHandler();
  const { toast: uiToast } = useToast();

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
      
      // Use a Map to prevent duplicates based on ID
      const insightMap = new Map<string, StrategicInsight>();
      
      // Add existing insights to the map
      existingInsights.forEach(insight => {
        insightMap.set(insight.id, insight);
      });
      
      // Add or update with new insights
      insightData.insights.forEach(insight => {
        // Only add if we don't already have this insight or if current insight has same ID but is from a different source
        if (!insightMap.has(insight.id)) {
          insightMap.set(insight.id, insight);
        } else {
          // If sources are different, keep both but modify the ID of the new one
          const existingInsight = insightMap.get(insight.id);
          if (existingInsight && existingInsight.source !== insight.source) {
            // Create a new ID by appending source to avoid collision
            const newId = `${insight.id}_${insight.source}`;
            console.log(`Insight ID collision detected. Creating new ID: ${newId}`);
            insightMap.set(newId, {...insight, id: newId});
          }
        }
      });
      
      // Convert map back to array
      const updatedInsights = Array.from(insightMap.values());
      
      console.log(`Persistence - Existing: ${existingInsights.length}, New: ${insightData.insights.length}, Total unique: ${updatedInsights.length}`);
      
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
      
      // Use sonner toast for consistency
      toast.error("Failed to save insights", {
        description: "Your insights couldn't be saved to local storage"
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
