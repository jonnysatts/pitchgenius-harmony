
import { useState, useCallback } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';

export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (insights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [websiteInsights, setWebsiteInsights] = useState<StrategicInsight[]>([]);
  const { toast } = useToast();

  const analyzeWebsite = useCallback(async () => {
    // Make sure we have a website URL to analyze
    if (!project.clientWebsite) {
      toast({
        title: "Missing Website URL",
        description: "Please add a website URL to the project before analyzing.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      toast({
        title: "Starting Website Analysis",
        description: "Beginning analysis of " + project.clientWebsite,
      });

      // Call the Firecrawl service via Supabase Edge Function
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      console.log("Website analysis results:", result);

      // If we got insights back, format and store them
      if (result && result.insights && result.insights.length > 0) {
        // Mark these insights as coming from website analysis
        const formattedInsights = result.insights.map((insight: any) => ({
          ...insight,
          source: 'website' as const
        }));

        // Store the new insights
        setWebsiteInsights(formattedInsights);
        
        // Add them to the global insights collection
        addInsights(formattedInsights);

        // Show success message
        toast({
          title: "Website Analysis Complete",
          description: `Generated ${formattedInsights.length} insights from ${project.clientWebsite}`,
        });
      } else {
        // Handle the case where we got a response but no insights
        const errorMessage = result?.error || "No insights could be generated from the website analysis";
        setError(errorMessage);
        
        toast({
          title: "Analysis Issue",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error analyzing website:", error);
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error during website analysis";
      
      setError(errorMessage);
      
      // Show error message
      toast({
        title: "Website Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, addInsights, setError, toast]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite
  };
};

export default useWebsiteAnalysis;
