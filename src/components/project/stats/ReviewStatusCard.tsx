
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewStatusCardProps {
  acceptedCount: number;
  rejectedCount: number;
  needsReviewCount: number;
}

const ReviewStatusCard: React.FC<ReviewStatusCardProps> = ({
  acceptedCount,
  rejectedCount,
  needsReviewCount
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Review Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-green-500">{acceptedCount}</span>
            <span className="text-xs text-slate-500">Accepted</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-500">{rejectedCount}</span>
            <span className="text-xs text-slate-500">Rejected</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-500">
              {needsReviewCount}
            </span>
            <span className="text-xs text-slate-500">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatusCard;
