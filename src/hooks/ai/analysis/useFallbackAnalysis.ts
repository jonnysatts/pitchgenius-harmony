
import { useCallback } from "react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fallback analysis when primary analysis fails
 */
export const useFallbackAnalysis = () => {
  const { toast } = useToast();
  
  const executeFallbackAnalysis = useCallback((
    documents: Document[],
    generateFallbackInsights: (documents: Document[]) => void
  ) => {
    console.log("Using fallback insight generation");
    generateFallbackInsights(documents);
    
    toast({
      title: "Analysis Complete",
      description: "Using fallback insights due to processing issues.",
      variant: "destructive"
    });
    
    return false;
  }, [toast]);
  
  return {
    executeFallbackAnalysis
  };
};
