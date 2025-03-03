
import React from "react";
import InsightCardActions from "./InsightCardActions";

interface InsightReviewControlsProps {
  showControls: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onUpdate?: (content: Record<string, any>) => void;
  content?: Record<string, any>;
}

const InsightReviewControls: React.FC<InsightReviewControlsProps> = (props) => {
  return (
    <InsightCardActions 
      {...props}
      reviewStatus="pending"
    />
  );
};

export default InsightReviewControls;
