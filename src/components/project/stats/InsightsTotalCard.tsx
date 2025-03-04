
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface InsightsTotalCardProps {
  insightCount: number;
  needsReviewCount: number;
}

const InsightsTotalCard: React.FC<InsightsTotalCardProps> = ({
  insightCount,
  needsReviewCount
}) => {
  const hasUnreviewed = needsReviewCount > 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasUnreviewed ? (
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
            ) : (
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle size={20} className="text-green-500" />
              </div>
            )}
            <div>
              <span className="text-2xl font-bold">{insightCount}</span>
              <span className="text-sm text-slate-500 ml-2">insights</span>
            </div>
          </div>
          
          {hasUnreviewed && (
            <div className="bg-amber-50 px-2 py-1 rounded-full text-xs text-amber-700">
              {needsReviewCount} need review
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsTotalCard;
