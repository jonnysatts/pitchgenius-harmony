
import { useState } from 'react';
import { StrategicInsight } from '@/lib/types';

export const useWebsiteAnalysisState = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [websiteInsights, setWebsiteInsights] = useState<StrategicInsight[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');

  return {
    isAnalyzing,
    setIsAnalyzing,
    websiteInsights,
    setWebsiteInsights,
    analysisProgress,
    setAnalysisProgress,
    analysisStatus,
    setAnalysisStatus
  };
};
