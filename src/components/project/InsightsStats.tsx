
import React from "react";
import { ConfidenceCard, ReviewStatusCard, InsightsTotalCard } from "./stats";

interface InsightsStatsProps {
  insightCount: number;
  acceptedCount: number;
  needsReviewCount: number;
  confidence?: number;
  usingFallbackInsights?: boolean;
}

const InsightsStats: React.FC<InsightsStatsProps> = ({
  insightCount,
  acceptedCount,
  needsReviewCount,
  confidence = 0,
  usingFallbackInsights = false
}) => {
  // Calculate rejected count based on insightCount and acceptedCount
  const rejectedCount = insightCount - acceptedCount - needsReviewCount;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <ConfidenceCard 
        confidence={confidence} 
        usingFallbackInsights={usingFallbackInsights} 
      />
      
      <ReviewStatusCard 
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        needsReviewCount={needsReviewCount}
      />
      
      <InsightsTotalCard 
        insightCount={insightCount}
        needsReviewCount={needsReviewCount}
      />
    </div>
  );
};

export default InsightsStats;
