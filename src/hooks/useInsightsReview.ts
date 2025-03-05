
import { useState, useMemo, useCallback } from "react";
import { StrategicInsight } from "@/lib/types";

export const useInsightsReview = (insights: StrategicInsight[] = []) => {
  const [reviewedInsights, setReviewedInsights] = useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});

  // Initialize the review status for new insights
  useMemo(() => {
    if (insights && insights.length > 0) {
      const newReviewedInsights = { ...reviewedInsights };
      let changedSomething = false;

      insights.forEach(insight => {
        if (!newReviewedInsights[insight.id]) {
          newReviewedInsights[insight.id] = 'pending';
          changedSomething = true;
        }
      });

      if (changedSomething) {
        setReviewedInsights(newReviewedInsights);
      }
    }
  }, [insights, reviewedInsights]);

  // Calculate counts from the current state
  const pendingCount = useMemo(() => {
    return Object.values(reviewedInsights).filter(status => status === 'pending').length;
  }, [reviewedInsights]);

  const acceptedCount = useMemo(() => {
    return Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  }, [reviewedInsights]);

  const rejectedCount = useMemo(() => {
    return Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  }, [reviewedInsights]);

  const needsReviewCount = useMemo(() => {
    return insights.filter(insight => insight.needsReview).length;
  }, [insights]);

  // Calculate overall confidence based on accepted insights
  const overallConfidence = useMemo(() => {
    // Get insights that have been accepted
    const acceptedInsights = insights.filter(insight => 
      reviewedInsights[insight.id] === 'accepted'
    );
    
    if (acceptedInsights.length === 0) return 0;
    
    // Calculate average confidence of accepted insights
    const totalConfidence = acceptedInsights.reduce((sum, insight) => sum + insight.confidence, 0);
    return totalConfidence / acceptedInsights.length;
  }, [insights, reviewedInsights]);

  // Get insights filtered by status
  const acceptedInsights = useMemo(() => {
    return insights.filter(insight => reviewedInsights[insight.id] === 'accepted');
  }, [insights, reviewedInsights]);

  const rejectedInsights = useMemo(() => {
    return insights.filter(insight => reviewedInsights[insight.id] === 'rejected');
  }, [insights, reviewedInsights]);

  // Get updated insights (combination of accepted and pending)
  const updatedInsights = useMemo(() => {
    return insights.filter(insight => 
      reviewedInsights[insight.id] === 'accepted' || 
      reviewedInsights[insight.id] === 'pending'
    );
  }, [insights, reviewedInsights]);

  // Handle accept insight
  const handleAcceptInsight = useCallback((insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'accepted'
    }));
  }, []);

  // Handle reject insight
  const handleRejectInsight = useCallback((insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'rejected'
    }));
  }, []);

  // Handle update insight
  const handleUpdateInsight = useCallback((insightId: string, updatedContent: Record<string, any>) => {
    // This would typically update the insight in a database
    // For now we're just updating the review status
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: prev[insightId] || 'pending'
    }));
  }, []);

  return {
    reviewedInsights,
    needsReviewCount,
    pendingCount,
    acceptedCount,
    rejectedCount,
    overallConfidence,
    acceptedInsights,
    rejectedInsights,
    updatedInsights,
    handleAcceptInsight,
    handleRejectInsight,
    handleUpdateInsight
  };
};

export default useInsightsReview;
