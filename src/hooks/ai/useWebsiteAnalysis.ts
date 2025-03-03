
import { useState, useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { analyzeClientWebsite } from '@/services/ai/websiteAnalysis';
import { toast } from '@/hooks/use-toast';

export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [websiteInsights, setWebsiteInsights] = useState<StrategicInsight[]>([]);
  
  const analyzeWebsiteUrl = useCallback(async () => {
    if (!project.clientWebsite) {
      setError('No website URL provided for analysis');
      toast({
        title: 'Missing Website URL',
        description: 'Please add a website URL to the project before analyzing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      toast({
        title: 'Analyzing Website',
        description: `Starting website analysis for ${project.clientWebsite}`,
      });

      // Clear existing insights when starting a new analysis
      setWebsiteInsights([]);
      
      const result = await analyzeClientWebsite(project);
      
      if (result.insights && result.insights.length > 0) {
        // Ensure all insights are properly marked as website-derived
        const markedInsights = result.insights.map(insight => {
          // Ensure the insight has the correct source
          return {
            ...insight,
            source: 'website' as 'website',  // Explicitly set source to 'website'
            // Add default values for any missing properties
            id: insight.id || `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            category: insight.category || 'company_positioning',
            confidence: insight.confidence || 80,
            needsReview: insight.needsReview !== undefined ? insight.needsReview : true,
            content: {
              ...(insight.content || {}),
              title: insight.content?.title || 'Website Insight',
              summary: insight.content?.summary || 'Analysis from website',
              details: insight.content?.details || 'No details provided',
              recommendations: insight.content?.recommendations || 'No recommendations provided'
            }
          };
        });
        
        console.log(`Website analysis generated ${markedInsights.length} insights`);
        console.log('Website insight categories:', markedInsights.map(i => i.category));
        
        setWebsiteInsights(markedInsights);
        
        // Replace the old website insights with new ones (instead of adding to them)
        // First get all non-website insights
        addInsights(markedInsights);
        
        toast({
          title: 'Website Analysis Complete',
          description: `Generated ${markedInsights.length} insights from ${project.clientWebsite}`,
        });
      } else {
        setError('No insights were generated from website analysis');
        toast({
          title: 'Website Analysis Issue',
          description: 'Could not generate insights from the website',
          variant: 'destructive',
        });
      }
      
      if (result.error) {
        setError(result.error);
        // Only show the error toast if no insights were generated
        if (!result.insights || result.insights.length === 0) {
          toast({
            title: 'Website Analysis Error',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('Error analyzing website:', err);
      setError(`Error analyzing website: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: 'Website Analysis Error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, addInsights, setError]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite: analyzeWebsiteUrl,
  };
};

export default useWebsiteAnalysis;
