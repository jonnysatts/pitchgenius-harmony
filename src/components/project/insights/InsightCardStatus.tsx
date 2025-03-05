
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe } from "lucide-react";

interface InsightCardStatusProps {
  needsReview: boolean;
  reviewStatus: 'accepted' | 'rejected' | 'pending';
  confidence?: number;
  sourceLabel?: string | null;
}

const InsightCardStatus: React.FC<InsightCardStatusProps> = ({
  needsReview,
  reviewStatus,
  confidence,
  sourceLabel
}) => {
  // Format confidence as percentage if available
  const confidenceDisplay = confidence !== undefined && !isNaN(confidence) 
    ? `${Math.round(confidence * 100)}%` 
    : null;
  
  return (
    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
      {/* Review status badge */}
      {reviewStatus === 'pending' && needsReview && (
        <Badge variant="outline" className="text-amber-500 border-amber-300 flex items-center gap-1">
          <Flag className="h-3 w-3" />
          <span>Needs Review</span>
        </Badge>
      )}
      
      {reviewStatus === 'accepted' && (
        <Badge variant="outline" className="text-green-500 border-green-300">Accepted</Badge>
      )}
      
      {reviewStatus === 'rejected' && (
        <Badge variant="outline" className="text-red-500 border-red-300">Rejected</Badge>
      )}
      
      {/* Source label for website-derived insights */}
      {sourceLabel && (
        <Badge variant="outline" className="text-blue-500 border-blue-300 flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <span>[{sourceLabel}]</span>
        </Badge>
      )}
      
      {/* Confidence level */}
      {confidenceDisplay && (
        <span className="text-sm text-muted-foreground">{confidenceDisplay} confidence</span>
      )}
    </div>
  );
};

export default InsightCardStatus;
