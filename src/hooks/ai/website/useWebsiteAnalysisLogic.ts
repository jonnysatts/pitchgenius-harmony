
import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { generateFallbackWebsiteInsights } from '@/utils/fallbackInsights';

export const useWebsiteAnalysisLogic = (
  project: Project,
  setIsAnalyzing: (analyzing: boolean) => void,
  setAnalysisProgress: (progress: number) => void,
  setAnalysisStatus: (status: string) => void,
  setWebsiteInsights: (insights: StrategicInsight[]) => void,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void,
  checkAnalysisProgress: Function
) => {
  const { toast } = useToast();

  const handleAnalysisTimeout = useCallback((
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    console.log("Website analysis timed out - using fallback insights");
    const fallbackInsights = generateFallbackWebsiteInsights(project);
    setError("Analysis timed out. Using sample insights instead of actual website analysis.");
    setWebsiteInsights(fallbackInsights);
    addInsights(fallbackInsights);
    setAnalysisProgress(100);
    setAnalysisStatus('Analysis complete (using sample data)');
    setIsAnalyzing(false);
    
    clearInterval(progressInterval);
    clearInterval(progressCheckInterval);
    
    toast({
      title: "Analysis Timeout",
      description: "Analysis took too long to complete. Try again or use a simpler website.",
      variant: "destructive"
    });
  }, [project, setError, setWebsiteInsights, addInsights, setAnalysisProgress, setAnalysisStatus, setIsAnalyzing, toast]);

  const processAnalysisResult = useCallback(async (
    result: any,
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    setAnalysisProgress(100);
    setAnalysisStatus('Analysis complete');
    
    console.log("Website analysis results:", result);

    if (result && result.insights && result.insights.length > 0) {
      const formattedInsights = result.insights.map((insight: any) => ({
        ...insight,
        source: 'website' as const
      }));

      setWebsiteInsights(formattedInsights);
      addInsights(formattedInsights);

      toast({
        title: "Website Analysis Complete",
        description: `Generated ${formattedInsights.length} insights from ${project.clientWebsite}`,
      });
    } else {
      const errorMessage = result?.error || "No insights returned from website analysis. The API may have failed to extract meaningful content.";
      const isRetriable = result?.retriableError === true;
      
      setError(errorMessage);
      
      if (!result.insights || result.insights.length === 0) {
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
      }
      
      toast({
        title: isRetriable ? "Claude API Temporarily Unavailable" : "Analysis Note",
        description: isRetriable 
          ? "Claude AI is currently overloaded. Please try again in a few minutes." 
          : "Analysis completed with limited results. See details for more information.",
        variant: isRetriable ? "destructive" : "default"
      });
    }
  }, [project, setAnalysisProgress, setAnalysisStatus, setWebsiteInsights, addInsights, setError, toast]);

  return {
    handleAnalysisTimeout,
    processAnalysisResult
  };
};
