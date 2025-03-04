
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWebsiteAnalysisProgress = (
  isAnalyzing: boolean,
  setAnalysisProgress: (progress: number) => void,
  setAnalysisStatus: (status: string) => void
) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isAnalyzing) {
      // Give a short delay before resetting progress
      const timer = setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisStatus('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, setAnalysisProgress, setAnalysisStatus]);

  return { setAnalysisProgress, setAnalysisStatus };
};
