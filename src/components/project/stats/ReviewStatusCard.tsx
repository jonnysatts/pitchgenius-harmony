
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
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Review Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 border border-green-100">
            <div className="p-2 bg-green-100 rounded-full mb-1">
              <Check size={18} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{acceptedCount}</span>
            <span className="text-xs text-green-800 font-medium">Accepted</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 border border-red-100">
            <div className="p-2 bg-red-100 rounded-full mb-1">
              <X size={18} className="text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{rejectedCount}</span>
            <span className="text-xs text-red-800 font-medium">Rejected</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="p-2 bg-blue-100 rounded-full mb-1">
              <Clock size={18} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{needsReviewCount}</span>
            <span className="text-xs text-blue-800 font-medium">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatusCard;
