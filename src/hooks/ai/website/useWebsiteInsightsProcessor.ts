import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { generateFallbackWebsiteInsights } from '@/utils/fallbackInsights';

export const useWebsiteInsightsProcessor = (
  project: Project,
  setError: (error: string | null) => void,
  setWebsiteInsights: (insights: StrategicInsight[]) => void,
  addInsights: (insights: StrategicInsight[]) => void
) => {
  const setupProgressChecking = useCallback((
    websiteUrl: string,
    checkAnalysisProgress: Function,
    setAnalysisProgress: (progress: number) => void,
    setIsAnalyzing: (analyzing: boolean) => void
  ) => {
    const progressInterval = setInterval(() => {
      const currentProgress = setAnalysisProgress as unknown as (progress: number | ((prev: number) => number)) => void;
      currentProgress((prev: number) => {
        const newValue = prev < 10 ? prev + 5 : 
                         prev < 20 ? prev + 2 : 
                         prev < 30 ? prev + 0.5 : 
                         Math.min(prev + 0.1, 95);
        return newValue;
      });
    }, 200);

    const progressCheckInterval = setInterval(() => {
      checkAnalysisProgress(
        websiteUrl,
        progressInterval,
        null, // No timeout to clear in the interval
        setAnalysisProgress,
        setIsAnalyzing
      );
    }, 5000);

    return { progressInterval, progressCheckInterval };
  }, []);

  const handleFallbackInsights = useCallback((reason: string) => {
    const fallbackInsights = generateFallbackWebsiteInsights(project);
    setError(`${reason}. Using sample insights instead.`);
    setWebsiteInsights(fallbackInsights);
    addInsights(fallbackInsights);
  }, [project, setError, setWebsiteInsights, addInsights]);

  const testApiConnection = useCallback(async (
    progressInterval: NodeJS.Timeout,
    progressCheckInterval: NodeJS.Timeout
  ) => {
    const testResult = await FirecrawlService.testWebsiteAnalysis();
    
    if (!testResult.success) {
      clearInterval(progressInterval);
      clearInterval(progressCheckInterval);
      
      handleFallbackInsights(`API setup issue: ${testResult.error || 'Connection failed'}`);
      return false;
    }
    
    return true;
  }, [handleFallbackInsights]);

  return {
    setupProgressChecking,
    handleFallbackInsights,
    testApiConnection
  };
};
