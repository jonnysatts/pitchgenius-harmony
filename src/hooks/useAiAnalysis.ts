import { useCallback, useEffect } from "react";
import { Project, Document, StoredInsightData } from "@/lib/types";
import { checkSupabaseConnection } from "@/services/ai";
import { useToast, toast } from "@/hooks/use-toast";

// Import the new smaller hooks
import { useAiStatus } from "./ai/useAiStatus";
import { useAiGeneration } from "./ai/useAiGeneration";
import { useAiResults } from "./ai/useAiResults";
import { useFallbackInsights } from "./ai/useFallbackInsights";
import { useWebsiteAnalysis } from "./ai/useWebsiteAnalysis";

export const useAiAnalysis = (project: Project) => {
  // Initialize all the smaller hooks
  const {
    insights,
    setInsights,
    error,
    setError,
    handleCompletionToast,
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
  
  // Add the new website analysis hook
  const {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite
  } = useWebsiteAnalysis(project, addInsights, setError);

  // Check for stored insights & setup processing status
  useEffect(() => {
    if (project?.id) {
      const storedData = localStorage.getItem(`project_insights_${project.id}`);
      if (storedData) {
        try {
          const parsedData: StoredInsightData = JSON.parse(storedData);
          
          // If we have insights stored, mark processing as complete
          if (parsedData.insights.length > 0) {
            completeProcessing('Loaded previous insights');
            setUsingFallbackInsights(parsedData.usingFallbackInsights);
          }
        } catch (err) {
          console.error('Error parsing stored insights status:', err);
        }
      }
    }
  }, [project.id, completeProcessing, setUsingFallbackInsights]);

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
  }, [handleCompletionToast, usingFallbackInsights, persistInsights, insights, insufficientContent]);

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
      
      // Try to generate insights with retry flag
      const success = await generateProjectInsights(documents, true);
      
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
    insufficientContent,
    setUseRealAI,
    handleAnalyzeDocuments,
    retryAnalysis,
    setInsights,
    setError,
    // Export the new website analysis functionality
    isAnalyzingWebsite: isAnalyzing,
    websiteInsights,
    analyzeWebsite
  };
};
