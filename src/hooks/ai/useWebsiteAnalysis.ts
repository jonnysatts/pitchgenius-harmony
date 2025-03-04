
import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useWebsiteAnalysisState } from './website/useWebsiteAnalysisState';
import { useWebsiteAnalysisProgress } from './website/useWebsiteAnalysisProgress';
import { useWebsiteUrlValidation } from './website/useWebsiteUrlValidation';
import { useProgressCheck } from './website/useProgressCheck';
import { useWebsiteAnalysisLogic } from './website/useWebsiteAnalysisLogic';
import { useWebsiteAnalysisNotifications } from './website/useWebsiteAnalysisNotifications';
import { useWebsiteInsightsProcessor } from './website/useWebsiteInsightsProcessor';

export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  // Get the state management hook
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

  // Get the URL validation hook
  const { isValidWebsiteUrl } = useWebsiteUrlValidation(project);

  // Get the progress checking hook
  const { checkAnalysisProgress } = useProgressCheck();

  // Set up the progress updates
  useWebsiteAnalysisProgress(isAnalyzing, setAnalysisProgress, setAnalysisStatus);

  // Get notifications helpers
  const {
    notifyAnalysisStart,
    notifyInvalidUrl,
    notifyMissingUrl,
    notifyApiSetupIssue,
    notifyAnalysisError
  } = useWebsiteAnalysisNotifications(project);

  // Get website processor helpers
  const {
    setupProgressChecking,
    handleFallbackInsights,
    testApiConnection
  } = useWebsiteInsightsProcessor(project, setError, setWebsiteInsights, addInsights);

  // Get the analysis logic helpers
  const {
    handleAnalysisTimeout,
    processAnalysisResult
  } = useWebsiteAnalysisLogic(
    project,
    setIsAnalyzing,
    setAnalysisProgress,
    setAnalysisStatus,
    setWebsiteInsights,
    addInsights,
    setError,
    checkAnalysisProgress
  );

  const analyzeWebsite = useCallback(async () => {
    setAnalysisProgress(0);
    setAnalysisStatus('Preparing to analyze website...');
    
    if (!project.clientWebsite) {
      notifyMissingUrl();
      return;
    }

    if (!isValidWebsiteUrl()) {
      notifyInvalidUrl();
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      notifyAnalysisStart();

      // Set up the analysis timeout
      const analysisTimeout = setTimeout(() => {
        // The handleAnalysisTimeout function requires progressInterval and progressCheckInterval
        // We'll pass null here and handle it inside the function
        handleAnalysisTimeout(null, null);
      }, 120000);

      // Set up progress tracking and monitoring
      const { progressInterval, progressCheckInterval } = setupProgressChecking(
        project.clientWebsite,
        checkAnalysisProgress,
        setAnalysisProgress,
        setIsAnalyzing
      );

      // Test API connection
      const apiConnectionSuccess = await testApiConnection(progressInterval, progressCheckInterval);
      if (!apiConnectionSuccess) {
        clearTimeout(analysisTimeout);
        setIsAnalyzing(false);
        notifyApiSetupIssue('API connection failed');
        return;
      }
      
      setAnalysisProgress(prev => Math.min(prev + 10, 40));
      
      // Call the API to analyze the website
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      // Clear all intervals and timeouts
      clearInterval(progressInterval);
      clearInterval(progressCheckInterval);
      clearTimeout(analysisTimeout);
      
      // Process the results
      await processAnalysisResult(result, progressInterval, progressCheckInterval);
    } catch (error) {
      console.error("Error analyzing website:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error during website analysis";
      
      setError(errorMessage);
      handleFallbackInsights(`Website analysis error: ${errorMessage}`);
      notifyAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    project,
    isValidWebsiteUrl,
    setIsAnalyzing,
    setAnalysisProgress,
    setAnalysisStatus,
    setError,
    notifyAnalysisStart,
    notifyInvalidUrl,
    notifyMissingUrl,
    notifyApiSetupIssue,
    notifyAnalysisError,
    handleAnalysisTimeout,
    setupProgressChecking,
    checkAnalysisProgress,
    testApiConnection,
    processAnalysisResult,
    handleFallbackInsights
  ]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite,
    analysisProgress,
    analysisStatus
  };
};

export default useWebsiteAnalysis;
