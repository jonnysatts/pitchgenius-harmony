
import { toast } from '@/hooks/use-toast';

/**
 * Hook to handle notifications for website analysis
 */
export const useWebsiteAnalysisNotifications = () => {
  const notifyAnalysisStarted = (url: string) => {
    toast({
      title: 'Analyzing Website',
      description: `Starting website analysis for ${url}`,
    });
  };

  const notifyAnalysisComplete = (url: string, insightsCount: number) => {
    toast({
      title: 'Website Analysis Complete',
      description: `Generated ${insightsCount} insights from ${url}`,
    });
  };

  const notifyAnalysisError = (error: string) => {
    toast({
      title: 'Website Analysis Error',
      description: error,
      variant: 'destructive',
    });
  };

  const notifyMissingWebsite = () => {
    toast({
      title: 'Missing Website URL',
      description: 'Please add a website URL to the project before analyzing',
      variant: 'destructive',
    });
  };

  return {
    notifyAnalysisStarted,
    notifyAnalysisComplete,
    notifyAnalysisError,
    notifyMissingWebsite
  };
};
