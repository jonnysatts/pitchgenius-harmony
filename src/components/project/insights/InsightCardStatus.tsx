
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Flag } from "lucide-react";

interface InsightCardStatusProps {
  needsReview: boolean;
  reviewStatus: 'accepted' | 'rejected' | 'pending';
  confidence: number;
}

const InsightCardStatus: React.FC<InsightCardStatusProps> = ({
  needsReview,
  reviewStatus,
  confidence
}) => {
  return (
    <div className="flex items-center">
      {needsReview && (
        <Badge variant="outline" className="mr-2 bg-amber-50 text-amber-600 border-amber-200">
          <Flag size={12} className="mr-1" /> Needs Review
        </Badge>
      )}
      
      {reviewStatus === 'accepted' && (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle size={12} className="mr-1" /> Accepted
        </Badge>
      )}
      
      {reviewStatus === 'rejected' && (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <AlertTriangle size={12} className="mr-1" /> Rejected
        </Badge>
      )}
    </div>
  );
};

export default InsightCardStatus;
