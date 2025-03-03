
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { 
  generateInsights, 
  monitorAIProcessingProgress 
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

  const updateUseRealAI = (value: boolean) => {
    setUseRealAI(value);
    console.log(`${value ? 'Using real AI' : 'Using mock AI'} for document analysis`);
  };

  // Define the completion callback
  const handleProcessingComplete = useCallback((setActiveTab: (tab: string) => void) => {
    console.log("AI processing complete, navigating to insights tab");
    setProcessingComplete(true);
    
    // Navigate to insights tab
    setActiveTab("insights");
    
    // Show completion toast
    toast({
      title: "Analysis complete",
      description: `Generated ${insights.length} strategic insights${useRealAI ? ' using Claude AI' : ''}`,
    });
  }, [insights.length, toast, useRealAI]);

  const handleAnalyzeDocuments = async (documents: Document[], setActiveTab: (tab: string) => void) => {
    if (documents.length === 0) {
      toast({
        title: "No documents to analyze",
        description: "Please upload documents before running the analysis",
        variant: "destructive"
      });
      return;
    }
    
    // Reset any previous errors and status
    setError(null);
    setProcessingComplete(false);
    
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
        title: useRealAI ? "Connecting to Anthropic API" : "Analyzing Documents",
        description: useRealAI 
          ? `Sending all ${documents.length} documents to Claude for in-depth analysis`
          : `Running AI analysis on all ${documents.length} documents`,
      });
      
      console.log(`Analyzing ${documents.length} documents using ${useRealAI ? 'Anthropic API' : 'mock generator'}`);
      
      // Call the AI service to generate insights
      const result = await generateInsights(project, documents);
      
      if (result.error) {
        toast({
          title: "Analysis failed",
          description: result.error,
          variant: "destructive"
        });
        setAiStatus({
          status: 'error',
          progress: 0,
          message: result.error
        });
        setError(result.error);
      } else {
        setInsights(result.insights);
        // Note: We don't need to manually set active tab here
        // The completion callback in the monitor will handle this
      }
    } catch (error: any) {
      console.error("Error analyzing documents:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive"
      });
      setAiStatus({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      setError(errorMessage);
      
      // Cancel monitoring on error
      cancelMonitoring();
    }
  };

  return {
    insights,
    aiStatus,
    error,
    useRealAI,
    processingComplete,
    setUseRealAI: updateUseRealAI,
    handleAnalyzeDocuments,
    setInsights,
    setError
  };
};
