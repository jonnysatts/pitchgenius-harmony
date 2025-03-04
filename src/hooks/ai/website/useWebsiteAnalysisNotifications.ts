
import { toast } from '@/hooks/use-toast';
import { AIProcessingStatus } from '@/lib/types';
import { monitorWebsiteAnalysisProgress } from '@/services/ai/statusTracking';

/**
 * Hook to handle notifications and status updates for website analysis
 */
export const useWebsiteAnalysisNotifications = () => {
  // Basic toast notifications
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

  // Advanced progress monitoring
  const startProgressMonitoring = (
    projectId: string,
    onStatusUpdate: (status: AIProcessingStatus) => void,
    onCompletionCallback?: () => void
  ): (() => void) => {
    return monitorWebsiteAnalysisProgress(
      projectId,
      onStatusUpdate,
      onCompletionCallback
    );
  };

  return {
    notifyAnalysisStarted,
    notifyAnalysisComplete,
    notifyAnalysisError,
    notifyMissingWebsite,
    startProgressMonitoring
  };
};
