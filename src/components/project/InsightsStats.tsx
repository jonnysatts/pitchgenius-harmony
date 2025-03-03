
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface InsightsStatsProps {
  overallConfidence: number;
  acceptedCount: number;
  rejectedCount: number;
  totalInsights: number;
  needsReviewCount: number;
}

const InsightsStats: React.FC<InsightsStatsProps> = ({
  overallConfidence,
  acceptedCount,
  rejectedCount,
  totalInsights,
  needsReviewCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{overallConfidence}%</span>
            <Progress 
              value={overallConfidence} 
              className="w-2/3" 
              indicatorColor={overallConfidence >= 80 ? "bg-green-500" : overallConfidence >= 60 ? "bg-amber-500" : "bg-red-500"}
            />
          </div>
        </CardContent>
      </Card>
      
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
                {totalInsights - acceptedCount - rejectedCount}
              </span>
              <span className="text-xs text-slate-500">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <AlertTriangle 
              size={24} 
              className={needsReviewCount > 0 ? "text-amber-500" : "text-green-500"} 
            />
            <div>
              <span className="text-2xl font-bold">{needsReviewCount}</span>
              <span className="text-sm text-slate-500 ml-1">insight{needsReviewCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsStats;
