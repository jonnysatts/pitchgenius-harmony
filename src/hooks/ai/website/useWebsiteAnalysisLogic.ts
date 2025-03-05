
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

  // Enhanced helper function to check if insights are all error-related
  const areAllErrorInsights = useCallback((insights: StrategicInsight[]) => {
    // Common patterns in error insight titles
    const errorTitles = [
      "Improve Website Accessibility",
      "Website Accessibility Issue", 
      "Website Unavailable",
      "Prioritize Website Accessibility",
      "Unable to Assess",
      "Unable to Identify",
      "Unable to Evaluate",
      "Unable to Provide",
      "Placeholder Title",
      "Essential Business Focus Areas",  // Match fallback titles
      "Target Audience Analysis",
      "Competitive Differentiation", 
      "Growth Expansion Possibilities",
      "Strategic Priorities",
      "Core Brand Narratives"
    ];
    
    // Error patterns in content details
    const errorContentPatterns = [
      "Failed to extract content",
      "could not be accessed",
      "HTTP error",
      "accessibility issues",
      "Website content could not be accessed",
      "No specific evidence",
      "Evidence would normally be extracted"
    ];
    
    // Check if any insights have error-related content
    const hasErrorContent = insights.some(insight => {
      const details = insight.content?.details || '';
      return errorContentPatterns.some(pattern => details.includes(pattern));
    });
    
    // Check if all insights have error-related titles or are marked as fallbacks
    const allErrorTitles = insights.every(insight => {
      const title = insight.content?.title || '';
      const id = insight.id || '';
      
      // Check if it's a fallback insight (they typically have IDs like fallback_1)
      const isFallbackInsight = id.includes('fallback_');
      
      // Check if title matches any error patterns
      const hasTitleMatch = errorTitles.some(errorTitle => title.includes(errorTitle));
      
      return hasTitleMatch || isFallbackInsight;
    });
    
    return hasErrorContent || allErrorTitles;
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
  }, [setError, setWebsiteInsights, setAnalysisProgress, setAnalysisStatus, setIsAnalyzing, toast]);

  const processAnalysisResult = useCallback(async (
    result: any,
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    // Use a direct value for setAnalysisProgress
    setAnalysisProgress(100);
    setAnalysisStatus('Analysis complete');
    
    console.log("Website analysis results:", result);

    // Check if we got any actual insights
    if (result && result.insights && result.insights.length > 0) {
      // Check if the insights are all error-related
      if (areAllErrorInsights(result.insights)) {
        console.log("Only error-related insights were found or fallback insights returned");
        
        // If result indicates using fallbacks, extract that information
        const usingFallback = result.usingFallback === true;
        
        // Extract error message from first insight or use provided error
        const errorDetail = usingFallback 
          ? "The Claude API is currently overloaded or returned insufficient content." 
          : (result.error || result.insights[0]?.content?.details || "The website could not be analyzed correctly.");
        
        setError(errorDetail);
        setWebsiteInsights([]);
        
        // Different toast messages based on the error type
        if (usingFallback || (result.error && result.error.includes('overloaded'))) {
          toast({
            title: "Claude API Temporarily Unavailable",
            description: "Claude AI is currently overloaded. Please try again in a few minutes.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Website Analysis Failed",
            description: "We couldn't extract meaningful content from the website.",
            variant: "destructive"
          });
        }
        
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
