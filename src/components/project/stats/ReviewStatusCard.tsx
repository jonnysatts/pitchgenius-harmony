
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";

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
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Review Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 rounded-md bg-green-50 border border-green-100">
            <Check size={18} className="text-green-600 mb-1" />
            <span className="text-2xl font-bold text-green-600">{acceptedCount}</span>
            <span className="text-xs text-green-800">Accepted</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-red-50 border border-red-100">
            <X size={18} className="text-red-600 mb-1" />
            <span className="text-2xl font-bold text-red-600">{rejectedCount}</span>
            <span className="text-xs text-red-800">Rejected</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-slate-50 border border-slate-200">
            <Clock size={18} className="text-slate-600 mb-1" />
            <span className="text-2xl font-bold text-slate-600">{needsReviewCount}</span>
            <span className="text-xs text-slate-800">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatusCard;
