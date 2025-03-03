
import { useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { useWebsiteAnalysisState } from './website/useWebsiteAnalysisState';
import { useWebsiteAnalysisLogic } from './website/useWebsiteAnalysisLogic';

/**
 * Main hook for website analysis that composes other specialized hooks
 */
export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const { isAnalyzing, websiteInsights } = useWebsiteAnalysisState();
  const { analyzeWebsiteUrl } = useWebsiteAnalysisLogic(project, addInsights, setError);
  
  // Expose a simpler interface to consumers of this hook
  const analyzeWebsite = useCallback(() => {
    analyzeWebsiteUrl();
  }, [analyzeWebsiteUrl]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite,
  };
};

export default useWebsiteAnalysis;
