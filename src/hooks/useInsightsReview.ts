
import { useState, useCallback, useEffect, useMemo } from "react";
import { StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useInsightsReview = (insights: StrategicInsight[]) => {
  // Initialize reviewedInsights with pending status for all insights
  const [reviewedInsights, setReviewedInsights] = useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  // Store updated insights to track changes
  const [updatedInsights, setUpdatedInsights] = useState<Record<string, StrategicInsight>>({});
  const { toast } = useToast();
  
  // Reset when insights change
  useEffect(() => {
    // Initialize with all insights set to pending
    const initialReviewState: Record<string, 'accepted' | 'rejected' | 'pending'> = {};
    const initialInsightsState: Record<string, StrategicInsight> = {};
    
    insights.forEach(insight => {
      // Keep existing review state if available, otherwise set to pending
      initialReviewState[insight.id] = reviewedInsights[insight.id] || 'pending';
      // Store the current insight
      initialInsightsState[insight.id] = updatedInsights[insight.id] || insight;
    });
    
    setReviewedInsights(initialReviewState);
    setUpdatedInsights(initialInsightsState);
  }, [insights]);
  
  // Count how many insights still need review
  const needsReviewCount = Object.values(reviewedInsights).filter(status => status === 'pending').length;
  
  // Get overall confidence based on accepted insights
  const overallConfidence = useMemo(() => {
    const acceptedInsights = insights.filter(insight => 
      reviewedInsights[insight.id] === 'accepted'
    );
    
    if (acceptedInsights.length === 0) return 0;
    
    // Calculate average confidence of accepted insights
    const totalConfidence = acceptedInsights.reduce((sum, insight) => 
      sum + (insight.confidence || 0), 0
    );
    
    return Math.round(totalConfidence / acceptedInsights.length);
  }, [insights, reviewedInsights]);
  
  // Get accepted insights - use the updated versions if available
  const acceptedInsights = useMemo(() => 
    insights
      .filter(insight => reviewedInsights[insight.id] === 'accepted')
      .map(insight => updatedInsights[insight.id] || insight),
    [insights, reviewedInsights, updatedInsights]
  );
  
  // Get rejected insights
  const rejectedInsights = useMemo(() => 
    insights.filter(insight => reviewedInsights[insight.id] === 'rejected'),
    [insights, reviewedInsights]
  );
  
  // Handler for accepting an insight
  const handleAcceptInsight = useCallback((insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'accepted'
    }));
    
    toast({
      title: "Insight Accepted",
      description: "This insight will be included in your presentation"
    });
  }, [toast]);
  
  // Handler for rejecting an insight
  const handleRejectInsight = useCallback((insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'rejected'
    }));
    
    toast({
      title: "Insight Rejected",
      description: "This insight will not be included in your presentation"
    });
  }, [toast]);
  
  // Handler for updating insight content
  const handleUpdateInsight = useCallback((insightId: string, updatedContent: Record<string, any>) => {
    // Find the original insight
    const originalInsight = insights.find(insight => insight.id === insightId);
    
    if (!originalInsight) {
      console.error(`Insight with ID ${insightId} not found`);
      return;
    }
    
    console.log("Updating insight:", insightId, "with content:", updatedContent);
    
    // Create the updated insight
    const updatedInsight: StrategicInsight = {
      ...originalInsight,
      content: {
        ...originalInsight.content,
        ...updatedContent
      }
    };
    
    // Update the insights map
    setUpdatedInsights(prev => ({
      ...prev,
      [insightId]: updatedInsight
    }));
    
    toast({
      title: "Insight Updated",
      description: "The insight has been refined based on your edits"
    });
  }, [insights, toast]);
  
  return {
    reviewedInsights,
    needsReviewCount,
    overallConfidence,
    acceptedInsights,
    rejectedInsights,
    handleAcceptInsight,
    handleRejectInsight,
    handleUpdateInsight,
    updatedInsights
  };
};

export default useInsightsReview;
