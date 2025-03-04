
import { useCallback } from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling insight updates and notifications
 */
export const useAiInsights = (
  project: Project,
  insights: StrategicInsight[],
  setInsights: (insights: StrategicInsight[], usingFallback: boolean) => void,
  persistInsights: (insights: StrategicInsight[], usingFallback: boolean) => void,
  usingFallbackInsights: boolean
) => {
  const { toast } = useToast();

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

  // Function to retry analysis with new documents
  const retryAnalysis = useCallback((
    setActiveTab: (tab: string) => void,
    startProcessing: (onComplete?: (setActiveTab: (tab: string) => void) => void) => (setActiveTab: (tab: string) => void) => void,
    handleProcessingComplete: (setActiveTab: (tab: string) => void) => void,
    generateProjectInsights: (documents: Document[], isRetry?: boolean) => Promise<boolean>,
    generateFallbackInsights: (documents: Document[]) => void,
    setAiStatus: (status: any) => void,
    setError: (error: string | null) => void,
    setUsingFallbackInsights: (usingFallback: boolean) => void,
    useRealAI: boolean
  ) => {
    return (documents: Document[]) => {
      // Reset states
      setError(null);
      setUsingFallbackInsights(false);
      
      // Clear any existing insights from storage to force fresh analysis
      if (project?.id) {
        localStorage.removeItem(`project_insights_${project.id}`);
        console.log("Cleared previous insights from storage for project", project.id);
      }
      
      // Update status to processing
      setAiStatus({
        status: 'processing',
        progress: 0,
        message: 'Retrying document analysis with Claude AI...'
      });
      
      // Start processing and get monitoring function
      const monitorProgress = startProcessing(handleProcessingComplete);
      
      return async () => {
        // Start monitoring
        monitorProgress(setActiveTab);
        
        // Add a toast notification for retry attempt
        toast({
          title: "Retrying Claude AI Analysis",
          description: `Analyzing ${documents.length} documents again with Claude AI...`,
        });
        
        console.log("Retrying document analysis with useRealAI set to:", useRealAI);
        
        // Try to generate insights with retry flag
        const success = await generateProjectInsights(documents, true);
        
        // If generation failed, use fallback insights
        if (!success) {
          generateFallbackInsights(documents);
        }
      };
    };
  }, [project?.id, toast]);

  return {
    handleCompletionToast,
    retryAnalysis
  };
};
