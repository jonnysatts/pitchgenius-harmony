
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FirecrawlService } from '@/utils/FirecrawlService';

export const useProgressCheck = () => {
  const { toast } = useToast();

  const checkAnalysisProgress = useCallback(async (
    websiteUrl: string,
    progressInterval: NodeJS.Timeout,
    analysisTimeout: NodeJS.Timeout,
    setAnalysisProgress: (progress: number) => void,
    setIsAnalyzing: (analyzing: boolean) => void
  ) => {
    try {
      const result = await FirecrawlService.checkAnalysisProgress(websiteUrl);
      
      if (!result.success) {
        console.log("Progress check failed, continuing simulation");
        return;
      }
      
      if (typeof result.progress === 'number') {
        // Fix: Use the value from result.progress instead of passing a function
        setAnalysisProgress(Math.max(result.progress || 0, 0));
        
        if ((result.progress || 0) >= 100) {
          clearInterval(progressInterval);
          clearTimeout(analysisTimeout);
          
          setIsAnalyzing(false);
          toast({
            title: "Analysis Complete",
            description: "Website insights are now available",
          });
        }
      }
    } catch (error) {
      console.error("Error checking analysis progress:", error);
    }
  }, [toast]);

  return { checkAnalysisProgress };
};
