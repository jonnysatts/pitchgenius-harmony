
import { useCallback } from 'react';
import { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useWebsiteAnalysisNotifications = (project: Project) => {
  const { toast } = useToast();
  
  const notifyAnalysisStart = useCallback(() => {
    toast({
      title: "Analysis Started",
      description: `Analyzing website: ${project.clientWebsite}. This may take up to 2 minutes.`
    });
  }, [project.clientWebsite, toast]);
  
  const notifyInvalidUrl = useCallback(() => {
    toast({
      title: "Invalid Website URL",
      description: "Please enter a valid website URL (e.g., https://example.com)",
      variant: "destructive"
    });
  }, [toast]);
  
  const notifyMissingUrl = useCallback(() => {
    toast({
      title: "No Website URL",
      description: "Please enter a website URL in the project details before analyzing",
      variant: "destructive"
    });
  }, [toast]);
  
  const notifyApiSetupIssue = useCallback((message: string) => {
    toast({
      title: "API Setup Issue",
      description: message || "There was an issue with the API setup. Please check your configuration.",
      variant: "destructive"
    });
  }, [toast]);
  
  const notifyAnalysisError = useCallback((errorMessage: string) => {
    toast({
      title: "Analysis Error",
      description: errorMessage || "An error occurred during website analysis.",
      variant: "destructive"
    });
  }, [toast]);
  
  const notifyClaudeOverloaded = useCallback(() => {
    toast({
      title: "Claude AI Overloaded",
      description: "Claude AI is currently experiencing high demand. Please try again in a few minutes. Using sample insights for now.",
      variant: "destructive"
    });
  }, [toast]);
  
  return {
    notifyAnalysisStart,
    notifyInvalidUrl,
    notifyMissingUrl,
    notifyApiSetupIssue,
    notifyAnalysisError,
    notifyClaudeOverloaded
  };
};
