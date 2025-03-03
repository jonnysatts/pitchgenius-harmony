import { useCallback } from "react";
import { Project, Document } from "@/lib/types";
import { checkSupabaseConnection } from "@/services/ai";
import { useEffect } from "react";

// Import the new smaller hooks
import { useAiStatus } from "./ai/useAiStatus";
import { useAiGeneration } from "./ai/useAiGeneration";
import { useAiResults } from "./ai/useAiResults";
import { useFallbackInsights } from "./ai/useFallbackInsights";

export const useAiAnalysis = (project: Project) => {
  // Initialize all the smaller hooks
  const {
    insights,
    setInsights,
    error,
    setError,
    handleCompletionToast
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
    generateProjectInsights
  } = useAiGeneration(
    project, 
    setInsights, 
    setError, 
    completeProcessing, 
    setUsingFallbackInsights
  );

  // Check for Anthropic API key on load
  useEffect(() => {
    const checkAiAvailability = async () => {
      try {
        const anthropicKeyExists = await checkSupabaseConnection();
        
        if (anthropicKeyExists) {
          setUseRealAI(true);
          console.log("Anthropic API key detected - will use real AI");
        } else {
          console.log("Anthropic API key not detected - will use mock AI");
        }
      } catch (err) {
        console.error('Error checking Supabase connection:', err);
      }
    };
    
    checkAiAvailability();
  }, [setUseRealAI]);

  // Define the completion callback
  const handleProcessingComplete = useCallback((setActiveTab: (tab: string) => void) => {
    handleCompletionToast(usingFallbackInsights);
  }, [handleCompletionToast, usingFallbackInsights]);

  // Main function to analyze documents
  const handleAnalyzeDocuments = async (documents: Document[], setActiveTab: (tab: string) => void) => {
    // Reset any previous errors, status, and fallback state
    setError(null);
    setUsingFallbackInsights(false);
    
    // Start processing and get monitoring function
    const monitorProgress = startProcessing(handleProcessingComplete);
    
    // Start monitoring
    monitorProgress(setActiveTab);
    
    // Try to generate insights
    const success = await generateProjectInsights(documents);
    
    // If generation failed, use fallback insights
    if (!success) {
      console.log("No insights returned, using mock generator as fallback");
      generateFallbackInsights(documents);
    }
  };

  // Add a retry analysis function
  const retryAnalysis = useCallback((setActiveTab: (tab: string) => void) => {
    // Reset states
    setError(null);
    setUsingFallbackInsights(false);
    
    // Update status to processing
    setAiStatus({
      status: 'processing',
      progress: 0,
      message: 'Retrying document analysis with Claude AI...'
    });
    
    // Start processing and get monitoring function
    const monitorProgress = startProcessing(handleProcessingComplete);
    
    return async (documents: Document[]) => {
      // Start monitoring
      monitorProgress(setActiveTab);
      
      // Add a toast notification for retry attempt
      toast({
        title: "Retrying Claude AI Analysis",
        description: `Analyzing ${documents.length} documents again with Claude AI...`,
      });
      
      // Try to generate insights
      const success = await generateProjectInsights(documents);
      
      // If generation failed, use fallback insights
      if (!success) {
        generateFallbackInsights(documents);
      }
    };
  }, [setError, setUsingFallbackInsights, setAiStatus, startProcessing, handleProcessingComplete, generateProjectInsights, generateFallbackInsights, toast]);

  return {
    insights,
    aiStatus,
    error,
    useRealAI,
    processingComplete,
    usingFallbackInsights,
    setUseRealAI,
    handleAnalyzeDocuments,
    retryAnalysis,
    setInsights,
    setError
  };
};
