
import { useState, useCallback } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { generateInsights } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useAiGeneration = (
  project: Project, 
  setInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void,
  completeProcessing: (message: string) => void,
  setUsingFallbackInsights: (value: boolean) => void
) => {
  const { toast } = useToast();
  const [useRealAI, setUseRealAI] = useState(false);

  const updateUseRealAI = (value: boolean) => {
    setUseRealAI(value);
    console.log(`${value ? 'Using real AI' : 'Using mock AI'} for document analysis`);
  };

  const generateProjectInsights = async (documents: Document[], isRetry = false) => {
    if (documents.length === 0) {
      toast({
        title: "No documents to analyze",
        description: "Please upload documents before running the analysis",
        variant: "destructive"
      });
      return false;
    }
    
    // Display different message based on whether it's a retry attempt
    toast({
      title: isRetry ? "Retrying Claude AI Analysis" : (useRealAI ? "Starting Claude AI Analysis" : "Analyzing Documents"),
      description: useRealAI 
        ? `Analyzing ${documents.length} documents with Claude AI (this may take up to 45 seconds)`
        : `Running AI analysis on all ${documents.length} documents`,
    });
    
    console.log(`${isRetry ? 'Retrying analysis' : 'Analyzing'} ${documents.length} documents using ${useRealAI ? 'Anthropic API' : 'mock generator'}`);
    
    try {
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
        completeProcessing('Analysis complete with fallback to sample insights');
        setError(result.error);
      } else {
        // If we got real insights, make sure we're not in fallback mode
        setUsingFallbackInsights(false);
      }
      
      // Check if we received any insights
      if (result.insights && result.insights.length > 0) {
        setInsights(result.insights);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error analyzing documents:", error);
      setError(error.message || "An unexpected error occurred");
      completeProcessing('Analysis failed with error');
      return false;
    }
  };

  return {
    useRealAI,
    setUseRealAI: updateUseRealAI,
    generateProjectInsights
  };
};
