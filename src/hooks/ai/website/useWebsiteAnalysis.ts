
import { useState, useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { useWebsiteAnalysisState } from './useWebsiteAnalysisState';
import { toast } from '@/hooks/use-toast';

export const useWebsiteAnalysis = (project: Project) => {
  const [analysisPhase, setAnalysisPhase] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const {
    isAnalyzing,
    setIsAnalyzing,
    websiteInsights,
    setWebsiteInsights
  } = useWebsiteAnalysisState();
  
  const hasWebsiteUrl = !!project.clientWebsite;
  const websiteUrl = project.clientWebsite || '';
  
  // Start the analysis process
  const startWebsiteAnalysis = useCallback(async () => {
    if (!hasWebsiteUrl) {
      toast({
        title: "Website URL Missing",
        description: "Please add a website URL in the project settings first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisPhase('preparing');
    setAnalysisError(null);
    
    try {
      // This is a placeholder for the actual analysis logic
      // In a real implementation, you would call your API here
      
      setAnalysisPhase('crawling');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setAnalysisPhase('insights');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate some insights
      // In a real implementation, these would come from your API
      const mockInsights: StrategicInsight[] = [
        {
          id: 'web-insight-1',
          category: 'business_imperatives',
          confidence: 0.85,
          needsReview: false,
          source: 'website',
          content: {
            title: 'Sample Insight 1',
            summary: 'This is a sample insight from the website analysis',
            details: 'Additional details would go here',
            recommendations: 'Recommendations would go here'
          }
        }
      ];
      
      setWebsiteInsights(mockInsights);
      setAnalysisPhase('completed');
      
      toast({
        title: "Analysis Complete",
        description: "Website insights are now available",
      });
    } catch (error) {
      console.error('Website analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : String(error));
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [hasWebsiteUrl, setIsAnalyzing, setWebsiteInsights, project.clientWebsite]);
  
  return {
    websiteUrl,
    websiteInsights,
    analysisPhase,
    analysisError,
    startWebsiteAnalysis,
    isAnalyzing,
    hasWebsiteUrl
  };
};

export default useWebsiteAnalysis;
