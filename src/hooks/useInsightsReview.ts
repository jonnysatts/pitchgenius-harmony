
import { useState, useEffect } from "react";
import { StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useInsightsReview = (insights: StrategicInsight[]) => {
  const [reviewedInsights, setReviewedInsights] = useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  const { toast } = useToast();

  // Initialize review status for insights
  useEffect(() => {
    if (insights.length > 0) {
      const initialReviewStatus: Record<string, 'accepted' | 'rejected' | 'pending'> = {};
      insights.forEach(insight => {
        initialReviewStatus[insight.id] = 'pending';
      });
      setReviewedInsights(initialReviewStatus);
    }
  }, [insights]);

  const handleAcceptInsight = (insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'accepted'
    }));
    
    toast({
      title: "Insight accepted",
      description: "This insight will be included in the final report",
    });
  };
  
  const handleRejectInsight = (insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'rejected'
    }));
    
    toast({
      title: "Insight rejected",
      description: "This insight will be excluded from the final report",
    });
  };

  return {
    reviewedInsights,
    handleAcceptInsight,
    handleRejectInsight
  };
};
