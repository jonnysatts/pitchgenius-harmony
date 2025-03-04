
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
      setAnalysisProgress(prev => {
        if (prev < 10) {
          return prev + 5;
        } else if (prev < 20) {
          return prev + 2;
        } else if (prev < 30) {
          return prev + 0.5;
        }
        return Math.min(prev + 0.1, 95);
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
