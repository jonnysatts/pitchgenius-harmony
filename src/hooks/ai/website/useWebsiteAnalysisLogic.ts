
import { useState, useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { useWebsiteAnalysisNotifications } from './useWebsiteAnalysisNotifications';
import { useWebsiteInsightsProcessor } from './useWebsiteInsightsProcessor';
import { analyzeClientWebsite } from '@/services/ai/websiteAnalysis';
import { useAiStatus } from '@/hooks/ai/useAiStatus';
import { processWebsiteInsights } from '@/services/ai/websiteAnalysis/websiteInsightProcessor';

/**
 * Hook to handle the logic for website analysis
 */
export const useWebsiteAnalysisLogic = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { 
    notifyAnalysisStarted, 
    notifyAnalysisComplete, 
    notifyAnalysisError, 
    notifyMissingWebsite,
    startProgressMonitoring 
  } = useWebsiteAnalysisNotifications();
  const { processWebsiteInsights: hookProcessInsights } = useWebsiteInsightsProcessor();
  
  // Use the AIStatus hook for progress tracking
  const { 
    aiStatus, 
    setAiStatus, 
    startWebsiteAnalysis 
  } = useAiStatus(project.id);
  
  // Main function to analyze website URL
  const analyzeWebsiteUrl = useCallback(async () => {
    // If no website URL, notify user and return
    if (!project.clientWebsite) {
      notifyMissingWebsite();
      return;
    }
    
    try {
      // Set analyzing state to true and clear any existing errors
      setIsAnalyzing(true);
      setError(null);
      
      // Notify the user that analysis has started
      notifyAnalysisStarted(project.clientWebsite);
      
      // Start the progress monitoring - this handles visual feedback
      const cancelProgressMonitoring = startWebsiteAnalysis()((tab) => {
        // This will be called when the progress monitoring completes
        console.log("Website analysis progress monitoring complete, navigating to:", tab);
      });
      
      // Perform the actual website analysis
      const result = await analyzeClientWebsite(project);
      
      // Handle potential errors in the result
      if (result.error) {
        console.warn('Website analysis completed with warning:', result.error);
        // We don't set the error state here because we want to still show the partial insights
      }
      
      // Process the insights and add them to the state
      if (result.insights && result.insights.length > 0) {
        // Use the service function to process insights with the project context
        const processedInsights = processWebsiteInsights(result.insights, project);
        
        if (processedInsights.length > 0) {
          // Add the insights to the project state
          addInsights(processedInsights);
          
          // Notify the user that analysis is complete
          notifyAnalysisComplete(project.clientWebsite, processedInsights.length);
        } else {
          // Handle the case where no insights were generated
          setError("No meaningful insights could be generated. Try refining the website URL.");
          notifyAnalysisError("No insights could be extracted from the website.");
        }
      } else {
        // Handle the case where the API returned no insights
        setError("No insights were returned from the analysis. Please try again later.");
        notifyAnalysisError("Analysis did not return any insights.");
      }
      
      // Update the analysis state
      setIsAnalyzing(false);
    } catch (err) {
      // Handle any errors that occurred during the analysis
      console.error('Error analyzing website:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      setError(`Website analysis failed: ${errorMessage}`);
      notifyAnalysisError(errorMessage);
      
      // Update the analysis state
      setIsAnalyzing(false);
    }
  }, [
    project, 
    addInsights, 
    setError, 
    notifyAnalysisStarted, 
    notifyAnalysisComplete, 
    notifyAnalysisError, 
    notifyMissingWebsite, 
    startWebsiteAnalysis
  ]);
  
  return {
    isAnalyzing,
    aiStatus,
    analyzeWebsiteUrl
  };
};
