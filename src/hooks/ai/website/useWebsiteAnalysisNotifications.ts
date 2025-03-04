
import { useCallback } from 'react';
import { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useWebsiteAnalysisNotifications = (project: Project) => {
  const { toast } = useToast();

  const notifyAnalysisStart = useCallback(() => {
    toast({
      title: "Starting Website Analysis",
      description: "Beginning analysis of " + project.clientWebsite,
    });
  }, [project.clientWebsite, toast]);

  const notifyInvalidUrl = useCallback(() => {
    toast({
      title: "Invalid Website URL",
      description: `"${project.clientWebsite}" doesn't appear to be a valid URL.`,
      variant: "destructive"
    });
  }, [project.clientWebsite, toast]);

  const notifyMissingUrl = useCallback(() => {
    toast({
      title: "Missing Website URL",
      description: "Please add a website URL to the project before analyzing.",
      variant: "destructive"
    });
  }, [toast]);

  const notifyApiSetupIssue = useCallback((error: string) => {
    toast({
      title: "Analysis Setup Issue",
      description: "API connection failed. Check logs for details.",
      variant: "destructive"
    });
  }, [toast]);

  const notifyAnalysisError = useCallback((error: string) => {
    toast({
      title: "Website Analysis Error",
      description: "An error occurred during analysis. See details for more information.",
      variant: "destructive"
    });
  }, [toast]);

  return {
    notifyAnalysisStart,
    notifyInvalidUrl,
    notifyMissingUrl,
    notifyApiSetupIssue,
    notifyAnalysisError
  };
};
