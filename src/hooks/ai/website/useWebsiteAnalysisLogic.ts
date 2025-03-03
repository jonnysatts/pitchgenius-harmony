
import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { analyzeClientWebsite } from '@/services/ai/websiteAnalysis';
import { useWebsiteAnalysisState } from './useWebsiteAnalysisState';
import { useWebsiteAnalysisNotifications } from './useWebsiteAnalysisNotifications';
import { useWebsiteInsightsProcessor } from './useWebsiteInsightsProcessor';

/**
 * Hook containing the core logic for website analysis
 */
export const useWebsiteAnalysisLogic = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const { 
    isAnalyzing, 
    setIsAnalyzing, 
    setWebsiteInsights 
  } = useWebsiteAnalysisState();
  
  const { 
    notifyAnalysisStarted, 
    notifyAnalysisComplete, 
    notifyAnalysisError, 
    notifyMissingWebsite 
  } = useWebsiteAnalysisNotifications();
  
  const { processWebsiteInsights } = useWebsiteInsightsProcessor();

  const analyzeWebsiteUrl = useCallback(async () => {
    if (!project.clientWebsite) {
      setError('No website URL provided for analysis');
      notifyMissingWebsite();
      return;
    }

    try {
      setIsAnalyzing(true);
      notifyAnalysisStarted(project.clientWebsite);

      // Clear existing insights when starting a new analysis
      setWebsiteInsights([]);
      
      const result = await analyzeClientWebsite(project);
      
      if (result.insights && result.insights.length > 0) {
        // Process the insights to ensure proper formatting
        const markedInsights = processWebsiteInsights(result.insights);
        
        console.log(`Website analysis generated ${markedInsights.length} insights`);
        console.log('Website insight categories:', markedInsights.map(i => i.category));
        
        setWebsiteInsights(markedInsights);
        
        // Add the insights to the global state
        addInsights(markedInsights);
        
        notifyAnalysisComplete(project.clientWebsite, markedInsights.length);
      } else {
        setError('No insights were generated from website analysis');
        notifyAnalysisError('Could not generate insights from the website');
      }
      
      if (result.error) {
        setError(result.error);
        // Only show the error toast if no insights were generated
        if (!result.insights || result.insights.length === 0) {
          notifyAnalysisError(result.error);
        }
      }
    } catch (err) {
      console.error('Error analyzing website:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error analyzing website: ${errorMessage}`);
      notifyAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, addInsights, setError, notifyAnalysisStarted, notifyAnalysisComplete, 
      notifyAnalysisError, notifyMissingWebsite, processWebsiteInsights, setIsAnalyzing, setWebsiteInsights]);

  return { analyzeWebsiteUrl };
};
