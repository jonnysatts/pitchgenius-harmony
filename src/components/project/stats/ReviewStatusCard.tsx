
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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Review Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-md bg-green-50">
            <span className="text-xl font-bold text-green-600">{acceptedCount}</span>
            <span className="text-xs text-green-800">Accepted</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-red-50">
            <span className="text-xl font-bold text-red-600">{rejectedCount}</span>
            <span className="text-xs text-red-800">Rejected</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-slate-50">
            <span className="text-xl font-bold text-slate-600">{needsReviewCount}</span>
            <span className="text-xs text-slate-800">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatusCard;
