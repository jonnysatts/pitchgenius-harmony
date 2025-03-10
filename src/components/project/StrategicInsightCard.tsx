
import React, { memo } from "react";
import { StrategicInsight } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import InsightCardHeader from "@/components/project/insights/InsightCardHeader";
import InsightCardContent from "@/components/project/insights/InsightCardContent";
import InsightCardActions from "@/components/project/insights/InsightCardActions";
import InsightCardStatus from "@/components/project/insights/InsightCardStatus";

interface StrategicInsightCardProps {
  insight: StrategicInsight;
  reviewStatus?: 'accepted' | 'rejected' | 'pending';
  onAccept?: () => void;
  onReject?: () => void;
  onUpdate?: (content: Record<string, any>) => void;
}

const StrategicInsightCard: React.FC<StrategicInsightCardProps> = ({ 
  insight, 
  reviewStatus = 'pending',
  onAccept,
  onReject,
  onUpdate
}) => {
  // Determine if we should add review controls
  const showReviewControls = !!onAccept && !!onReject && reviewStatus === 'pending';
  
  // Modify the insight source display - don't show [Website-derived] for document insights
  const displaySource = insight.source === 'document' ? null : (insight.source === 'website' ? 'Website-derived' : insight.source);

  return (
    <Card className={insight.needsReview ? "border-amber-300" : ""}>
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <InsightCardHeader 
            category={insight.category}
            title={insight.content.title}
            confidence={insight.confidence}
          />
          
          <InsightCardStatus 
            needsReview={insight.needsReview}
            reviewStatus={reviewStatus}
            confidence={insight.confidence}
            sourceLabel={displaySource}
          />
        </div>
      </CardHeader>
      <CardContent>
        <InsightCardContent content={insight.content} />
        
        <InsightCardActions
          showControls={showReviewControls}
          reviewStatus={reviewStatus}
          onAccept={onAccept}
          onReject={onReject}
          onUpdate={onUpdate}
          content={insight.content}
        />
      </CardContent>
    </Card>
  );
};

// Apply React.memo to prevent unnecessary re-renders
export default memo(StrategicInsightCard);
