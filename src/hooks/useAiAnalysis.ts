
import { useCallback } from "react";
import { Project, Document, StoredInsightData } from "@/lib/types";
import { checkSupabaseConnection } from "@/services/ai";
// Import the toast from use-toast
import { useToast } from "@/hooks/use-toast";

// Import the new smaller hooks
import { useAiStatus } from "./ai/useAiStatus";
import { useAiGeneration } from "./ai/useAiGeneration";
import { useAiResults } from "./ai/useAiResults";
import { useFallbackInsights } from "./ai/useFallbackInsights";
import { useWebsiteAnalysis } from "./ai/useWebsiteAnalysis";
import { useAiInsights } from "./ai/useAiInsights";
import { useAiAnalysisMain } from "./ai/useAiAnalysisMain";

export const useAiAnalysis = (project: Project) => {
  // Get toast for notifications
  const { toast } = useToast();
  
  // Initialize all the smaller hooks
  const {
    insights,
    setInsights,
    error,
    setError,
    persistInsights,
    addInsights
  } = useAiResults(project);
  
  const {
    aiStatus,
    processingComplete,
    isAnalysisInProgress,
    startProcessing,
    completeProcessing,
    setAiStatus
  } = useAiStatus(project.id);
  
  const {
    usingFallbackInsights,
    setUsingFallbackInsights,
    generateFallbackInsights
  } = useFallbackInsights(project, isAnalysisInProgress, insights, setInsights);
  
  const {
    useRealAI,
    setUseRealAI,
    generateProjectInsights,
    insufficientContent,
    setInsufficientContent
  } = useAiGeneration(
    project, 
    setInsights, 
    setError, 
    completeProcessing, 
    setUsingFallbackInsights
  );
  
  // Add the hooks for insights and main analysis
  const {
    handleCompletionToast
  } = useAiInsights(
    project,
    insights,
    setInsights,
    persistInsights,
    usingFallbackInsights
  );
  
  // Define the completion callback
  const handleProcessingComplete = useCallback((setActiveTab: (tab: string) => void) => {
    // If there's insufficient content and no insights, offer to do website analysis
    if (insufficientContent && insights.length === 0) {
      toast({
        title: "Document Analysis Complete",
        description: "Not enough information in documents. Try website analysis instead.",
        variant: "default"
      });
      
      // Stay on insights tab to see the message
      setActiveTab("insights");
      return;
    }
    
    handleCompletionToast(usingFallbackInsights);
    
    // Ensure insights are persisted with fallback status
    persistInsights(insights, usingFallbackInsights);
    
    // Navigate to insights tab
    setActiveTab("insights");
  }, [handleCompletionToast, usingFallbackInsights, persistInsights, insights, insufficientContent, toast]);
  
  const { handleAnalyzeDocuments } = useAiAnalysisMain(
    project,
    generateProjectInsights,
    generateFallbackInsights,
    startProcessing,
    handleProcessingComplete
  );
  
  // Add the website analysis hook
  const {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite
  } = useWebsiteAnalysis(project, addInsights, setError);
  
  // Use the retryAnalysis function from useAiInsights
  const { retryAnalysis: retryAnalysisFactory } = useAiInsights(
    project,
    insights,
    setInsights,
    persistInsights,
    usingFallbackInsights
  );
  
  // Create the retryAnalysis function with all dependencies
  const retryAnalysis = useCallback((setActiveTab: (tab: string) => void) => {
    const retryHandler = retryAnalysisFactory(
      setActiveTab,
      startProcessing,
      handleProcessingComplete,
      generateProjectInsights,
      generateFallbackInsights,
      setAiStatus,
      setError,
      setUsingFallbackInsights,
      useRealAI
    );
    
    return retryHandler;
  }, [
    retryAnalysisFactory,
    startProcessing,
    handleProcessingComplete,
    generateProjectInsights,
    generateFallbackInsights,
    setAiStatus,
    setError,
    setUsingFallbackInsights,
    useRealAI
  ]);

  return {
    insights,
    aiStatus,
    error,
    useRealAI,
    processingComplete,
    usingFallbackInsights,
    insufficientContent,
    setUseRealAI,
    handleAnalyzeDocuments,
    retryAnalysis,
    setInsights,
    setError,
    // Export the website analysis functionality
    isAnalyzingWebsite: isAnalyzing,
    websiteInsights,
    analyzeWebsite
  };
};
