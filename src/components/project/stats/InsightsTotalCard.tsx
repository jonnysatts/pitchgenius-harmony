
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
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${hasUnreviewed ? 'bg-amber-100' : 'bg-green-100'}`}>
                {hasUnreviewed ? (
                  <AlertTriangle size={22} className="text-amber-500" />
                ) : (
                  <CheckCircle size={22} className="text-green-500" />
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2">{insightCount}</span>
                <span className="text-slate-500 flex items-center">
                  <LightbulbIcon size={16} className="mr-1" />
                  <span className="text-sm">insights</span>
                </span>
              </div>
            </div>
          </div>
          
          {hasUnreviewed && (
            <div className="bg-amber-50 px-4 py-2 rounded-lg text-sm font-medium text-amber-700 border border-amber-200 flex items-center justify-center">
              <AlertTriangle size={14} className="mr-2" />
              {needsReviewCount} {needsReviewCount === 1 ? 'insight' : 'insights'} need review
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsTotalCard;
