
import { useState, useCallback, useEffect } from 'react';
import { Project, StrategicInsight } from '@/lib/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { generateFallbackWebsiteInsights } from '@/utils/fallbackInsights';

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

  // Reset progress when analysis stops
  useEffect(() => {
    if (!isAnalyzing) {
      // Give a short delay before resetting progress
      const timer = setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisStatus('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

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

      // Set up timeout for the entire operation - increased to 120 seconds to give more time
      // This is longer than before to ensure we don't hit timeouts
      const analysisTimeout = setTimeout(() => {
        console.log("Website analysis timed out - using fallback insights");
        
        // Generate fallback insights
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        
        // Add timeout-specific message
        setError("Analysis timed out. Using sample insights instead of actual website analysis. In a production environment with valid API keys, this would analyze your actual website data.");
        
        // Add the fallback insights
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        // Complete the process
        setAnalysisProgress(100);
        setAnalysisStatus('Analysis complete (using sample data)');
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Timeout",
          description: "Using sample insights due to timeout. This would work with valid API keys in production.",
          variant: "destructive"
        });
      }, 120000); // 120 second timeout for the entire process (increased from 90s)

      // Create progress simulation with optimized timing to make the UI more responsive
      // Progress moves more quickly at beginning and slows down later to give impression of actual analysis
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Move faster at the beginning to give a sense of progress
          if (prev < 15) {
            setAnalysisStatus('Fetching website content...');
            return prev + 4; // Faster initial progress (increased from 3)
          } else if (prev < 35) {
            setAnalysisStatus('Crawling website pages...');
            return prev + 2; // Moderately fast progress (increased from 1.5)
          } else if (prev < 60) {
            setAnalysisStatus('Claude AI is analyzing website data...');
            return prev + 0.7; // More visible progress (increased from 0.5)
          } else if (prev < 80) {
            setAnalysisStatus('Generating strategic insights...');
            return prev + 0.5; // Slightly faster (increased from 0.3)
          } else if (prev < 95) {
            setAnalysisStatus('Finalizing analysis...');
            return prev + 0.3; // Slightly faster (increased from 0.2)
          }
          return prev;
        });
      }, 200); // Update progress more frequently (reduced from 250ms)

      // First perform a test to make sure the Edge Function is accessible
      const testResult = await FirecrawlService.testWebsiteAnalysis();
      
      if (!testResult.success) {
        clearInterval(progressInterval);
        clearTimeout(analysisTimeout);
        setIsAnalyzing(false);
        setError(`Edge Function unavailable: ${testResult.error || 'API keys not configured'}. Using sample insights instead.`);
        
        // Generate and use fallback insights
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        toast({
          title: "Analysis Setup Issue",
          description: "Using sample insights. In production, this would connect to AI services.",
          variant: "destructive"
        });
        return;
      }
      
      // Add a faster progress boost after successful connection test
      setAnalysisProgress(prev => Math.min(prev + 10, 40));
      
      // Call the Firecrawl service via Supabase Edge Function
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      clearInterval(progressInterval);
      clearTimeout(analysisTimeout);
      
      // Ensure the progress shows completion
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
        const errorMessage = result?.error || "No insights returned from website analysis. The API may have failed to extract meaningful content.";
        setError(errorMessage);
        
        // Generate fallback insights
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        
        // Add disclaimer that these are fallback insights with clearer messaging
        if (result.error) {
          setError(result.error);
        } else {
          setError("Using sample insights for this demo. With valid API keys in production, this would analyze your actual website content.");
        }
        
        // Add the fallback insights
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        toast({
          title: "Demo Mode",
          description: "Using sample insights. This would work with valid API keys in production.",
          variant: "default"  // Changed from destructive to default to avoid alarm
        });
      }
    } catch (error) {
      console.error("Error analyzing website:", error);
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error during website analysis";
      
      setError(errorMessage);
      
      // Generate fallback insights
      const fallbackInsights = generateFallbackWebsiteInsights(project);
      
      // Add disclaimer that these are fallback insights with specific error message
      setError(`Website analysis error: ${errorMessage}. Using sample insights instead.`);
      
      // Add the fallback insights
      setWebsiteInsights(fallbackInsights);
      addInsights(fallbackInsights);
      
      toast({
        title: "Website Analysis Error",
        description: "Using sample insights due to an error. This would work with configured API keys in production.",
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
