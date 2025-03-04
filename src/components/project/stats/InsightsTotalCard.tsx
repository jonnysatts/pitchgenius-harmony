
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, LightbulbIcon } from "lucide-react";

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
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hasUnreviewed ? 'bg-amber-100' : 'bg-green-100'}`}>
              {hasUnreviewed ? (
                <AlertTriangle size={22} className="text-amber-500" />
              ) : (
                <CheckCircle size={22} className="text-green-500" />
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold mr-2">{insightCount}</span>
              <LightbulbIcon size={16} className="text-slate-400 mr-1" />
              <span className="text-sm text-slate-500">insights</span>
            </div>
          </div>
          
          {hasUnreviewed && (
            <div className="bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700 border border-amber-200">
              {needsReviewCount} need review
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsTotalCard;
