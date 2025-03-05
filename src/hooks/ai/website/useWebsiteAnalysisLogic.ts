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

  // Helper function to check if insights are all error-related
  const areAllErrorInsights = useCallback((insights: StrategicInsight[]) => {
    const errorTitles = [
      "Improve Website Accessibility",
      "Website Accessibility Issue", 
      "Website Unavailable",
      "Prioritize Website Accessibility",
      "Unable to Assess",
      "Unable to Identify",
      "Unable to Evaluate",
      "Unable to Provide",
      "Placeholder Title"
    ];
    
    return insights.every(insight => 
      errorTitles.some(errorTitle => 
        insight.content?.title?.includes(errorTitle)
      )
    );
  }, []);

  const handleAnalysisTimeout = useCallback((
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    console.log("Website analysis timed out - clearing all insights");
    setError("Analysis timed out. Please try a different website or check your internet connection.");
    setWebsiteInsights([]);
    
    // Use a direct value for setAnalysisProgress instead of a function
    setAnalysisProgress(100);
    setAnalysisStatus('Analysis failed (timeout)');
    setIsAnalyzing(false);
    
    if (progressInterval) clearInterval(progressInterval);
    if (progressCheckInterval) clearInterval(progressCheckInterval);
    
    toast({
      title: "Analysis Timeout",
      description: "Analysis took too long to complete. Try again or use a simpler website.",
      variant: "destructive"
    });
  }, [project, setError, setWebsiteInsights, setAnalysisProgress, setAnalysisStatus, setIsAnalyzing, toast]);

  const processAnalysisResult = useCallback(async (
    result: any,
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    // Use a direct value for setAnalysisProgress
    setAnalysisProgress(100);
    setAnalysisStatus('Analysis complete');
    
    console.log("Website analysis results:", result);

    if (result && result.insights && result.insights.length > 0) {
      // Check if the insights are all error-related
      if (areAllErrorInsights(result.insights)) {
        console.log("Only error-related insights were found");
        
        // Extract error message from first insight
        const errorDetail = result.insights[0]?.content?.details || 
                          result.error || 
                          "The website could not be analyzed correctly.";
        
        setError(errorDetail);
        setWebsiteInsights([]);
        
        toast({
          title: "Website Analysis Failed",
          description: "We couldn't extract meaningful content from the website.",
          variant: "destructive"
        });
        
        return;
      }
      
      // Format insights with source property
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
      
      // Don't add fallback insights - keep the array empty
      setWebsiteInsights([]);
      
      toast({
        title: isRetriable ? "Claude API Temporarily Unavailable" : "Analysis Failed",
        description: isRetriable 
          ? "Claude AI is currently overloaded. Please try again in a few minutes." 
          : "Analysis failed to extract meaningful content. Try a different website.",
        variant: "destructive"
      });
    }
  }, [project, setAnalysisProgress, setAnalysisStatus, setWebsiteInsights, addInsights, setError, toast, areAllErrorInsights]);

  return {
    handleAnalysisTimeout,
    processAnalysisResult
  };
};
