
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
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const { toast } = useToast();

  // Check if website URL is valid
  const isValidWebsiteUrl = useCallback(() => {
    if (!project.clientWebsite) return false;
    
    try {
      // Simple URL validation logic
      const url = project.clientWebsite.startsWith('http') 
        ? project.clientWebsite
        : `https://${project.clientWebsite}`;
        
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, [project.clientWebsite]);

  const analyzeWebsite = useCallback(async () => {
    // Reset states
    setAnalysisProgress(0);
    setAnalysisStatus('Preparing to analyze website...');
    
    // Make sure we have a website URL to analyze
    if (!project.clientWebsite) {
      toast({
        title: "Missing Website URL",
        description: "Please add a website URL to the project before analyzing.",
        variant: "destructive"
      });
      return;
    }

    // Validate URL format
    if (!isValidWebsiteUrl()) {
      toast({
        title: "Invalid Website URL",
        description: `"${project.clientWebsite}" doesn't appear to be a valid URL.`,
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

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev < 20) {
            setAnalysisStatus('Preparing to crawl website...');
            return prev + 2;
          } else if (prev < 40) {
            setAnalysisStatus('Crawling website pages...');
            return prev + 1;
          } else if (prev < 60) {
            setAnalysisStatus('Analyzing website content with Claude AI...');
            return prev + 0.5;
          } else if (prev < 80) {
            setAnalysisStatus('Generating strategic insights...');
            return prev + 0.3;
          } else if (prev < 95) {
            setAnalysisStatus('Finalizing analysis...');
            return prev + 0.2;
          }
          return prev;
        });
      }, 300);

      // First perform a test to make sure the Edge Function is accessible
      const testResult = await FirecrawlService.testWebsiteAnalysis();
      
      if (!testResult.success) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setError(`Edge Function test failed: ${testResult.error || 'Unknown error'}`);
        
        toast({
          title: "Analysis Setup Failed",
          description: "Unable to initialize website analysis. Please check diagnostics.",
          variant: "destructive"
        });
        return;
      }
      
      // Call the Firecrawl service via Supabase Edge Function
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisStatus('Analysis complete');
      
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
  }, [project, addInsights, setError, toast, isValidWebsiteUrl]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite,
    analysisProgress,
    analysisStatus
  };
};

export default useWebsiteAnalysis;
