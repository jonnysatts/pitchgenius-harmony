
import { useState, useCallback } from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { analyzeClientWebsite } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useWebsiteAnalysis = (
  project: Project,
  addInsights: (newInsights: StrategicInsight[]) => void,
  setError: (error: string | null) => void
) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteInsights, setWebsiteInsights] = useState<StrategicInsight[]>([]);

  const analyzeWebsite = useCallback(async () => {
    // Skip if no website URL is provided
    if (!project.clientWebsite) {
      toast({
        title: "No website provided",
        description: "Please add a client website URL to analyze",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Show toast that analysis is starting
      toast({
        title: "Analyzing website",
        description: `Researching ${project.clientWebsite} for strategic insights...`,
      });

      const result = await analyzeClientWebsite(project);
      
      if (result.insights && result.insights.length > 0) {
        // Store the insights locally
        setWebsiteInsights(result.insights);
        
        // Add the insights to the main insights collection
        addInsights(result.insights);
        
        // Show success toast with instruction to check Web Insights tab
        toast({
          title: "Website analysis complete",
          description: `Generated ${result.insights.length} insights from website research. View them in the Web Insights tab.`,
        });
        
        // If there was an error but we still got insights, show warning
        if (result.error) {
          setError(result.error);
          // Only show error toast if it's not just saying we used sample insights
          if (!result.error.includes("Using sample website insights")) {
            toast({
              title: "Website analysis partial success",
              description: result.error,
              variant: "destructive"
            });
          }
        }
        
        return true;
      } else {
        // Show error toast
        toast({
          title: "Website analysis failed",
          description: result.error || "No insights could be generated from the website",
          variant: "destructive"
        });
        
        setError(result.error || "Failed to generate insights from website");
        return false;
      }
    } catch (err) {
      console.error("Error analyzing website:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      setError(`Error analyzing website: ${errorMessage}`);
      
      toast({
        title: "Website analysis failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
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
