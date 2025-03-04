
import { useState, useCallback, useEffect } from "react";
import { Project, Document, StrategicInsight, StoredInsightData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { errorService } from "@/services/error/errorService";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";

export const useAiResults = (project: Project) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load insights from storage on initial mount
  useEffect(() => {
    if (project?.id) {
      try {
        const storedData = localStorage.getItem(`project_insights_${project.id}`);
        if (storedData) {
          const parsedData: StoredInsightData = JSON.parse(storedData);
          setInsights(parsedData.insights);
          console.log(`Loaded ${parsedData.insights.length} insights from storage for project ${project.id}`);
        }
      } catch (err) {
        handleError(err, { context: 'loading-insights', projectId: project.id });
        console.error('Error parsing stored insights:', err);
      }
    }
  }, [project.id, handleError]);

  // Persist insights whenever they change
  const persistInsights = useCallback((newInsights: StrategicInsight[], usingFallback: boolean = false) => {
    if (project?.id && newInsights.length > 0) {
      try {
        const storageData: StoredInsightData = {
          projectId: project.id,
          insights: newInsights,
          generationTimestamp: Date.now(),
          usingFallbackData: usingFallback,
          timestamp: new Date().toISOString(),
          usingFallbackInsights: usingFallback
        };
        
        localStorage.setItem(`project_insights_${project.id}`, JSON.stringify(storageData));
        console.log(`Stored ${newInsights.length} insights for project ${project.id}`);
      } catch (err) {
        handleError(err, { context: 'persisting-insights', projectId: project.id });
        console.error('Error storing insights:', err);
      }
    }
  }, [project.id, handleError]);

  // Enhanced setInsights that also persists
  const setPersistentInsights = useCallback((newInsights: StrategicInsight[], usingFallback: boolean = false) => {
    setInsights(newInsights);
    persistInsights(newInsights, usingFallback);
    
    // Show a toast notification when insights are updated
    if (newInsights.length > 0) {
      toast({
        title: `${usingFallback ? "Sample" : "New"} insights added`,
        description: `${newInsights.length} insights are now available for review.`,
        variant: "default"
      });
    }
  }, [persistInsights, toast]);
  
  // Add new insights to existing ones
  const addInsights = useCallback((newInsights: StrategicInsight[]) => {
    if (!newInsights || newInsights.length === 0) {
      console.warn('No new insights to add');
      toast({
        title: "No insights generated",
        description: "The analysis completed but no insights were generated. Try again or check your content.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Adding ${newInsights.length} new insights`, newInsights);
    
    setInsights(currentInsights => {
      try {
        // For website insights, remove all existing website insights first
        if (newInsights.some(insight => insight.source === 'website')) {
          console.log('Found website insights, replacing all existing website insights');
          
          // Filter out all existing website insights
          const nonWebsiteInsights = currentInsights.filter(
            insight => insight.source !== 'website'
          );
          
          // Combine with new website insights
          const combinedInsights = [...nonWebsiteInsights, ...newInsights];
          
          // Persist the combined insights
          persistInsights(combinedInsights);
          
          // Show a toast notification
          toast({
            title: "Website insights added",
            description: `${newInsights.length} website insights are now available for review.`,
            variant: "default"
          });
          
          return combinedInsights;
        }
        
        // For non-website insights, just append (avoiding duplicates)
        // Filter out any duplicates based on content.title
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
            description: "The analysis completed but all insights were duplicates of existing ones.",
            variant: "default"
          });
          return currentInsights;
        }
        
        // Combine existing and new insights
        const combinedInsights = [...currentInsights, ...filteredNewInsights];
        
        // Persist the combined insights
        persistInsights(combinedInsights);
        
        // Show a toast notification
        toast({
          title: "Document insights added",
          description: `${filteredNewInsights.length} document insights are now available for review.`,
          variant: "default"
        });
        
        return combinedInsights;
      } catch (err) {
        handleError(err, { context: 'adding-insights', projectId: project.id });
        console.error('Error adding insights:', err);
        return currentInsights;
      }
    });
  }, [persistInsights, toast, project.id, handleError]);

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
    setError,
    handleCompletionToast,
    persistInsights,
    addInsights
  };
};
