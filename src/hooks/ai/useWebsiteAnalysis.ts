
import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { generateFallbackWebsiteInsights } from '@/utils/fallbackInsights';
import { useWebsiteAnalysisState } from './website/useWebsiteAnalysisState';
import { useWebsiteAnalysisProgress } from './website/useWebsiteAnalysisProgress';
import { useWebsiteUrlValidation } from './website/useWebsiteUrlValidation';
import { useProgressCheck } from './website/useProgressCheck';

export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const { toast } = useToast();
  const { isValidWebsiteUrl } = useWebsiteUrlValidation(project);
  const { checkAnalysisProgress } = useProgressCheck();
  
  const {
    isAnalyzing,
    setIsAnalyzing,
    websiteInsights,
    setWebsiteInsights,
    analysisProgress,
    setAnalysisProgress,
    analysisStatus,
    setAnalysisStatus
  } = useWebsiteAnalysisState();

  useWebsiteAnalysisProgress(isAnalyzing, setAnalysisProgress, setAnalysisStatus);

  const analyzeWebsite = useCallback(async () => {
    setAnalysisProgress(0);
    setAnalysisStatus('Preparing to analyze website...');
    
    if (!project.clientWebsite) {
      toast({
        title: "Missing Website URL",
        description: "Please add a website URL to the project before analyzing.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidWebsiteUrl()) {
      toast({
        title: "Invalid Website URL",
        description: `"${project.clientWebsite}" doesn't appear to be a valid URL.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      toast({
        title: "Starting Website Analysis",
        description: "Beginning analysis of " + project.clientWebsite,
      });

      const analysisTimeout = setTimeout(() => {
        console.log("Website analysis timed out - using fallback insights");
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        setError("Analysis timed out. Using sample insights instead of actual website analysis.");
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        setAnalysisProgress(100);
        setAnalysisStatus('Analysis complete (using sample data)');
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Timeout",
          description: "Analysis took too long to complete. Try again or use a simpler website.",
          variant: "destructive"
        });
      }, 120000);

      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev < 10) {
            setAnalysisStatus('Connecting to analysis service...');
            return prev + 5;
          } else if (prev < 20) {
            setAnalysisStatus('Fetching website content...');
            return prev + 2;
          } else if (prev < 30) {
            return prev + 0.5;
          }
          return Math.min(prev + 0.1, 95);
        });
      }, 200);

      const progressCheckInterval = setInterval(() => {
        checkAnalysisProgress(
          project.clientWebsite!,
          progressInterval,
          analysisTimeout,
          setAnalysisProgress,
          setIsAnalyzing
        );
      }, 5000);

      const testResult = await FirecrawlService.testWebsiteAnalysis();
      
      if (!testResult.success) {
        clearInterval(progressInterval);
        clearInterval(progressCheckInterval);
        clearTimeout(analysisTimeout);
        setIsAnalyzing(false);
        setError(`API setup issue: ${testResult.error || 'Connection failed'}. Using sample insights instead.`);
        
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        toast({
          title: "Analysis Setup Issue",
          description: "API connection failed. Check logs for details.",
          variant: "destructive"
        });
        return;
      }
      
      setAnalysisProgress(prev => Math.min(prev + 10, 40));
      
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      clearInterval(progressInterval);
      clearInterval(progressCheckInterval);
      clearTimeout(analysisTimeout);
      
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
        setError(errorMessage);
        
        if (!result.insights || result.insights.length === 0) {
          const fallbackInsights = generateFallbackWebsiteInsights(project);
          setWebsiteInsights(fallbackInsights);
          addInsights(fallbackInsights);
        }
        
        toast({
          title: "Analysis Note",
          description: "Analysis completed with limited results. See details for more information.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error analyzing website:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error during website analysis";
      
      setError(errorMessage);
      
      const fallbackInsights = generateFallbackWebsiteInsights(project);
      setError(`Website analysis error: ${errorMessage}. Using sample insights instead.`);
      setWebsiteInsights(fallbackInsights);
      addInsights(fallbackInsights);
      
      toast({
        title: "Website Analysis Error",
        description: "An error occurred during analysis. See details for more information.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, addInsights, setError, toast, isValidWebsiteUrl, checkAnalysisProgress]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite,
    analysisProgress,
    analysisStatus
  };
};

export default useWebsiteAnalysis;
