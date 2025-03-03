
import { useState, useCallback, useEffect } from "react";
import { Project, Document, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { 
  generateInsights, 
  monitorAIProcessingProgress,
  generateComprehensiveInsights 
} from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useAiAnalysis = (project: Project) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [aiStatus, setAiStatus] = useState<AIProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze documents'
  });
  const [error, setError] = useState<string | null>(null);
  const [useRealAI, setUseRealAI] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false);
  const [usingFallbackInsights, setUsingFallbackInsights] = useState(false);

  const updateUseRealAI = (value: boolean) => {
    setUseRealAI(value);
    console.log(`${value ? 'Using real AI' : 'Using mock AI'} for document analysis`);
  };

  // Define the completion callback
  const handleProcessingComplete = useCallback((setActiveTab: (tab: string) => void) => {
    console.log("AI processing complete, navigating to insights tab");
    setProcessingComplete(true);
    setIsAnalysisInProgress(false);
    
    // Navigate to insights tab
    setActiveTab("insights");
    
    // Show the appropriate completion toast based on whether we used fallback insights
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
          description: `Generated ${insights.length} strategic insights${useRealAI ? ' using Claude AI' : ''}`,
        });
      }
    }
  }, [insights.length, toast, useRealAI, usingFallbackInsights]);

  // Ensure we always have insights, even when unexpected delays occur
  useEffect(() => {
    // If analysis is in progress but we have no insights after 20 seconds,
    // generate mock insights as a fallback (reduced from 25 seconds)
    let fallbackTimer: NodeJS.Timeout | null = null;
    
    if (isAnalysisInProgress && insights.length === 0) {
      fallbackTimer = setTimeout(() => {
        // Only generate fallback insights if none have been loaded yet
        if (insights.length === 0) {
          console.log("Analysis taking too long, generating fallback insights");
          const mockInsights = generateComprehensiveInsights(project, []);
          setInsights(mockInsights);
          setUsingFallbackInsights(true);
          
          toast({
            title: "Fallback insights ready",
            description: "Using generated sample insights due to delay in processing",
            variant: "default"
          });
        }
      }, 20000); // Reduced from 25000 to 20000 ms
    }
    
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isAnalysisInProgress, insights.length, project, toast]);

  const handleAnalyzeDocuments = async (documents: Document[], setActiveTab: (tab: string) => void) => {
    if (documents.length === 0) {
      toast({
        title: "No documents to analyze",
        description: "Please upload documents before running the analysis",
        variant: "destructive"
      });
      return;
    }
    
    // Reset any previous errors, status, and fallback state
    setError(null);
    setProcessingComplete(false);
    setIsAnalysisInProgress(true);
    setUsingFallbackInsights(false);
    
    // Update status to processing
    setAiStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting document analysis...'
    });
    
    // Set up progress monitoring with completion callback
    const cancelMonitoring = monitorAIProcessingProgress(
      project.id,
      (status) => setAiStatus(status),
      () => handleProcessingComplete(setActiveTab)
    );
    
    try {
      // Display different message based on whether we're using real AI or not
      toast({
        title: useRealAI ? "Starting Claude AI Analysis" : "Analyzing Documents",
        description: useRealAI 
          ? `Analyzing ${documents.length} documents with Claude AI (this may take a few moments)`
          : `Running AI analysis on all ${documents.length} documents`,
      });
      
      console.log(`Analyzing ${documents.length} documents using ${useRealAI ? 'Anthropic API' : 'mock generator'}`);
      
      // Call the AI service to generate insights
      const result = await generateInsights(project, documents);
      
      if (result.error) {
        // If there was an error or we fell back to sample insights, update the fallback state
        setUsingFallbackInsights(true);
        
        toast({
          title: "Analysis notice",
          description: result.error,
          variant: "default"
        });
        setAiStatus({
          status: 'completed',
          progress: 100,
          message: 'Analysis complete with fallback to sample insights'
        });
        setError(result.error);
      }
      
      // Check if we received any insights
      if (!result.insights || result.insights.length === 0) {
        console.log("No insights returned, using mock generator as fallback");
        // Fallback to mock generator if no insights were returned
        const mockInsights = generateComprehensiveInsights(project, documents);
        setInsights(mockInsights);
        setUsingFallbackInsights(true);
        
        toast({
          title: "Analysis complete (using samples)",
          description: "Generated sample insights based on your documents",
          variant: "default"
        });
      } else {
        setInsights(result.insights);
      }
    } catch (error: any) {
      console.error("Error analyzing documents:", error);
      
      // Generate mock insights as a fallback
      console.log("Error during analysis, using mock generator as fallback");
      const mockInsights = generateComprehensiveInsights(project, documents);
      setInsights(mockInsights);
      setUsingFallbackInsights(true);
      
      const errorMessage = error.message || "An unexpected error occurred";
      toast({
        title: "Warning: Analysis had issues",
        description: "Using generated sample insights instead. " + errorMessage,
        variant: "default"
      });
    }
  };

  return {
    insights,
    aiStatus,
    error,
    useRealAI,
    processingComplete,
    usingFallbackInsights,
    setUseRealAI: updateUseRealAI,
    handleAnalyzeDocuments,
    setInsights,
    setError
  };
};
