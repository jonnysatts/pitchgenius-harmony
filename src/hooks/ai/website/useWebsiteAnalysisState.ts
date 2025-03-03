
import { useState } from 'react';
import { StrategicInsight } from '@/lib/types';

/**
 * Hook to manage the state for website analysis
 */
export const useWebsiteAnalysisState = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [websiteInsights, setWebsiteInsights] = useState<StrategicInsight[]>([]);
  
  return {
    isAnalyzing,
    setIsAnalyzing,
    websiteInsights,
    setWebsiteInsights
  };
};
