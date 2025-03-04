
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

  // Function to periodically check analysis progress
  const checkAnalysisProgress = useCallback(async (
    websiteUrl: string,
    progressInterval: NodeJS.Timeout,
    analysisTimeout: NodeJS.Timeout
  ) => {
    try {
      const result = await FirecrawlService.checkAnalysisProgress(websiteUrl);
      
      if (!result.success) {
        console.log("Progress check failed, continuing simulation");
        return;
      }
      
      // If we got valid progress data, update the UI
      if (typeof result.progress === 'number') {
        // Only update if the new progress is higher
        setAnalysisProgress(prev => Math.max(prev, result.progress || 0));
        
        // If analysis is complete, stop checking
        if ((result.progress || 0) >= 100) {
          clearInterval(progressInterval);
          clearTimeout(analysisTimeout);
          
          // Complete the analysis
          setIsAnalyzing(false);
          toast({
            title: "Analysis Complete",
            description: "Website insights are now available",
          });
        }
      }
    } catch (error) {
      console.error("Error checking analysis progress:", error);
      // Just log the error, don't stop the process
    }
  }, [toast]);

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

      // Setup timeout for the entire operation - set to 120 seconds
      const analysisTimeout = setTimeout(() => {
        console.log("Website analysis timed out - using fallback insights");
        
        // Generate fallback insights
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        
        // Add timeout-specific message
        setError("Analysis timed out. Using sample insights instead of actual website analysis.");
        
        // Add the fallback insights
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        // Complete the process
        setAnalysisProgress(100);
        setAnalysisStatus('Analysis complete (using sample data)');
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Timeout",
          description: "Analysis took too long to complete. Try again or use a simpler website.",
          variant: "destructive"
        });
      }, 120000); // 120 seconds timeout

      // Create progress simulation to give immediate feedback
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Move faster at the beginning to show progress immediately
          if (prev < 10) {
            setAnalysisStatus('Connecting to analysis service...');
            return prev + 5; // Quick start
          } else if (prev < 20) {
            setAnalysisStatus('Fetching website content...');
            return prev + 2; // Still fairly quick
          } else if (prev < 30) {
            // After 30%, we'll rely more on the actual progress updates from the server
            return prev + 0.5;
          }
          // After 30%, only make tiny increments to show the system is still working
          return Math.min(prev + 0.1, 95); // Never reach 100% through simulation
        });
      }, 200); // Update frequently at first for responsive UI

      // Set up real progress checking every 5 seconds
      const progressCheckInterval = setInterval(() => {
        checkAnalysisProgress(
          project.clientWebsite!,
          progressInterval,
          analysisTimeout
        );
      }, 5000); // Check every 5 seconds

      // First perform a test to make sure the Edge Function is accessible
      const testResult = await FirecrawlService.testWebsiteAnalysis();
      
      if (!testResult.success) {
        clearInterval(progressInterval);
        clearInterval(progressCheckInterval);
        clearTimeout(analysisTimeout);
        setIsAnalyzing(false);
        setError(`API setup issue: ${testResult.error || 'Connection failed'}. Using sample insights instead.`);
        
        // Generate and use fallback insights
        const fallbackInsights = generateFallbackWebsiteInsights(project);
        setWebsiteInsights(fallbackInsights);
        addInsights(fallbackInsights);
        
        toast({
          title: "Analysis Setup Issue",
          description: "API connection failed. Check logs for details.",
          variant: "destructive"
        });
        return;
      }
      
      // Add a faster progress boost after successful connection test
      setAnalysisProgress(prev => Math.min(prev + 10, 40));
      
      // Call the Firecrawl service
      const result = await FirecrawlService.analyzeWebsiteViaSupabase(
        project.clientWebsite,
        project.clientName || "",
        project.clientIndustry || "technology"
      );

      // Clear all intervals and timeouts as we have a response
      clearInterval(progressInterval);
      clearInterval(progressCheckInterval);
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
        
        // Generate fallback insights if we don't have any
        if (!result.insights || result.insights.length === 0) {
          const fallbackInsights = generateFallbackWebsiteInsights(project);
          
          // Add the fallback insights
          setWebsiteInsights(fallbackInsights);
          addInsights(fallbackInsights);
        }
        
        toast({
          title: "Analysis Note",
          description: "Analysis completed with limited results. See details for more information.",
          variant: "default"
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
        description: "An error occurred during analysis. See details for more information.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, addInsights, setError, toast, isValidWebsiteUrl, checkAnalysisProgress]);

  return {
    isAnalyzing,
    websiteInsights,
    analyzeWebsite,
    analysisProgress,
    analysisStatus
  };
};

export default useWebsiteAnalysis;
