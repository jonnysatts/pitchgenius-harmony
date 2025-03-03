
import { useState, useEffect } from "react";
import { Project, Document, StrategicInsight } from "@/lib/types";
import { generateComprehensiveInsights } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useFallbackInsights = (
  project: Project,
  isAnalysisInProgress: boolean,
  insights: StrategicInsight[],
  setInsights: (insights: StrategicInsight[]) => void
) => {
  const { toast } = useToast();
  const [usingFallbackInsights, setUsingFallbackInsights] = useState(false);

  // Ensure we always have insights, even when unexpected delays occur
  useEffect(() => {
    // If analysis is in progress but we have no insights after 45 seconds,
    // generate mock insights as a fallback
    let fallbackTimer: NodeJS.Timeout | null = null;
    
    if (isAnalysisInProgress && insights.length === 0) {
      fallbackTimer = setTimeout(() => {
        // Only generate fallback insights if none have been loaded yet
        if (insights.length === 0) {
          console.log("Analysis taking too long, generating fallback insights");
          const mockInsights = generateComprehensiveInsights(project, []);
          setInsights(mockInsights);
          setUsingFallbackInsights(true);
          
          toast({
            title: "Fallback insights ready",
            description: "Using generated sample insights due to delay in processing",
            variant: "default"
          });
        }
      }, 45000); // 45 seconds timeout (increased from 30 seconds)
    }
    
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isAnalysisInProgress, insights.length, project, setInsights, toast]);

  const generateFallbackInsights = (documents: Document[]) => {
    console.log("Generating fallback insights as requested or due to error");
    const mockInsights = generateComprehensiveInsights(project, documents);
    setInsights(mockInsights);
    setUsingFallbackInsights(true);
    
    toast({
      title: "Analysis complete (using samples)",
      description: "Generated sample insights based on your documents",
      variant: "default"
    });
    
    return mockInsights;
  };

  return {
    usingFallbackInsights,
    setUsingFallbackInsights,
    generateFallbackInsights
  };
};
