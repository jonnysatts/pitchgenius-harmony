
import React from "react";
import { StrategicInsight } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import InsightCardHeader from "@/components/project/insights/InsightCardHeader";
import InsightCardContent from "@/components/project/insights/InsightCardContent";
import InsightReviewControls from "@/components/project/insights/InsightReviewControls";

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
  // Determine if we should add review controls or show accepted/rejected status
  const showReviewControls = !!onAccept && !!onReject && reviewStatus === 'pending';

  return (
    <Card className={insight.needsReview ? "border-amber-300" : ""}>
      <CardHeader className="pb-2">
        <InsightCardHeader 
          category={insight.category}
          title={insight.content.title}
          confidence={insight.confidence}
          needsReview={insight.needsReview}
          reviewStatus={reviewStatus}
        />
      </CardHeader>
      <CardContent>
        <InsightCardContent content={insight.content} />
        
        <InsightReviewControls
          showControls={showReviewControls}
          onAccept={onAccept}
          onReject={onReject}
          onUpdate={onUpdate}
          content={insight.content}
        />
      </CardContent>
    </Card>
  );
};

export default StrategicInsightCard;
