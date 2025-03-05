import { useState, useCallback, useEffect, useMemo } from "react";
import { StrategicInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useInsightsReview = (insights: StrategicInsight[]) => {
  // Initialize reviewedInsights with pending status for all insights
  const [reviewedInsights, setReviewedInsights] = useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  // Store updated insights to track changes
  const [updatedInsights, setUpdatedInsights] = useState<Record<string, StrategicInsight>>({});
  const { toast } = useToast();
  
  // Reset and sync state when insights array changes
  useEffect(() => {
    if (!insights || insights.length === 0) {
      console.log('useInsightsReview: No insights provided, resetting state');
      setReviewedInsights({});
      setUpdatedInsights({});
      return;
    }
    
    // Initialize with all insights set to pending
    const initialReviewState: Record<string, 'accepted' | 'rejected' | 'pending'> = {};
    const initialInsightsState: Record<string, StrategicInsight> = {};
    
    insights.forEach(insight => {
      if (!insight || !insight.id) {
        console.warn('useInsightsReview: Encountered insight with missing ID');
        return;
      }
      
      // Keep existing review state if available, otherwise set to pending
      initialReviewState[insight.id] = reviewedInsights[insight.id] || 'pending';
      // Store the current insight
      initialInsightsState[insight.id] = updatedInsights[insight.id] || insight;
    });
    
    setReviewedInsights(initialReviewState);
    setUpdatedInsights(initialInsightsState);

    // Log current insights count for debugging
    console.log(`useInsightsReview: Processing ${insights.length} insights`);
  }, [insights]);
  
  // Calculate counts directly from the insights array to ensure accuracy
  const { pendingCount, acceptedCount, rejectedCount } = useMemo(() => {
    // Default values if insights array is empty
    if (!insights || insights.length === 0) {
      return { pendingCount: 0, acceptedCount: 0, rejectedCount: 0 };
    }
    
    // Count insights by review status
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    
    insights.forEach(insight => {
      if (!insight || !insight.id) return;
      
      const status = reviewedInsights[insight.id];
      if (status === 'accepted') accepted++;
      else if (status === 'rejected') rejected++;
      else pending++; // 'pending' or undefined
    });
    
    console.log(`Calculated counts - Pending: ${pending}, Accepted: ${accepted}, Rejected: ${rejected}, Total: ${insights.length}`);
    
    return { pendingCount: pending, acceptedCount, rejectedCount };
  }, [insights, reviewedInsights]);
  
  // Calculate needs review count (same as pendingCount for clarity)
  const needsReviewCount = pendingCount;
  
  // Get overall confidence based on accepted insights
  const overallConfidence = useMemo(() => {
    // No accepted insights means 0 confidence
    if (acceptedCount === 0) return 0;
    
    // Filter insights to get only accepted ones
    const acceptedInsightsArray = insights.filter(insight => 
      insight && insight.id && reviewedInsights[insight.id] === 'accepted'
    );
    
    // Calculate average confidence of accepted insights
    const totalConfidence = acceptedInsightsArray.reduce((sum, insight) => 
      sum + (insight.confidence || 0), 0
    );
    
    const avgConfidence = Math.round(totalConfidence / acceptedInsightsArray.length);
    console.log(`Calculated overall confidence: ${avgConfidence}% from ${acceptedInsightsArray.length} accepted insights`);
    
    return avgConfidence;
  }, [insights, reviewedInsights, acceptedCount]);
  
  // Get accepted insights - use the updated versions if available
  const acceptedInsights = useMemo(() => {
    if (!insights || insights.length === 0) return [];
    
    const accepted = insights
      .filter(insight => insight && insight.id && reviewedInsights[insight.id] === 'accepted')
      .map(insight => updatedInsights[insight.id] || insight);
      
    console.log(`Calculated acceptedInsights: ${accepted.length} insights`);
    return accepted;
  }, [insights, reviewedInsights, updatedInsights]);
  
  // Get rejected insights
  const rejectedInsights = useMemo(() => {
    if (!insights || insights.length === 0) return [];
    
    const rejected = insights.filter(insight => 
      insight && insight.id && reviewedInsights[insight.id] === 'rejected'
    );
    
    console.log(`Calculated rejectedInsights: ${rejected.length} insights`);
    return rejected;
  }, [insights, reviewedInsights]);
  
  // Handler for accepting an insight
  const handleAcceptInsight = useCallback((insightId: string) => {
    if (!insightId) {
      console.error('handleAcceptInsight: Invalid insight ID');
      return;
    }
    
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'accepted'
    }));
    
    toast({
      title: "Insight Accepted",
      description: "This insight will be included in your presentation"
    });
    
    console.log(`Insight ${insightId} marked as accepted`);
  }, [toast]);
  
  // Handler for rejecting an insight
  const handleRejectInsight = useCallback((insightId: string) => {
    if (!insightId) {
      console.error('handleRejectInsight: Invalid insight ID');
      return;
    }
    
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'rejected'
    }));
    
    toast({
      title: "Insight Rejected",
      description: "This insight will not be included in your presentation"
    });
    
    console.log(`Insight ${insightId} marked as rejected`);
  }, [toast]);
  
  // Handler for updating insight content
  const handleUpdateInsight = useCallback((insightId: string, updatedContent: Record<string, any>) => {
    if (!insightId) {
      console.error('handleUpdateInsight: Invalid insight ID');
      return;
    }
    
    // Find the original insight
    const originalInsight = insights.find(insight => insight && insight.id === insightId);
    
    if (!originalInsight) {
      console.error(`Insight with ID ${insightId} not found`);
      return;
    }
    
    console.log("Updating insight:", insightId, "with content:", updatedContent);
    
    // Create the updated insight with merged content
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
    pendingCount,
    acceptedCount,
    rejectedCount,
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
