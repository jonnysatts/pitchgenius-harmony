
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface InsightsStatsProps {
  insightCount: number;
  acceptedCount: number;
  needsReviewCount: number;
  confidence?: number;
  usingFallbackInsights?: boolean;
}

const InsightsStats: React.FC<InsightsStatsProps> = ({
  insightCount,
  acceptedCount,
  needsReviewCount,
  confidence = 0,
  usingFallbackInsights = false
}) => {
  // Calculate rejected count based on insightCount and acceptedCount
  const rejectedCount = insightCount - acceptedCount - needsReviewCount;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Confidence
            {usingFallbackInsights && (
              <span className="text-xs text-amber-500 ml-2">(Fallback)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{confidence}%</span>
            <Progress 
              value={confidence} 
              className="w-2/3" 
              indicatorColor={confidence >= 80 ? "bg-green-500" : confidence >= 60 ? "bg-amber-500" : "bg-red-500"}
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
                {needsReviewCount}
              </span>
              <span className="text-xs text-slate-500">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <AlertTriangle 
              size={24} 
              className={needsReviewCount > 0 ? "text-amber-500" : "text-green-500"} 
            />
            <div>
              <span className="text-2xl font-bold">{insightCount}</span>
              <span className="text-sm text-slate-500 ml-1">total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsStats;
