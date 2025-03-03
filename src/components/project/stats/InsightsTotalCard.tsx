
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface InsightsTotalCardProps {
  insightCount: number;
  needsReviewCount: number;
}

const InsightsTotalCard: React.FC<InsightsTotalCardProps> = ({
  insightCount,
  needsReviewCount
}) => {
  return (
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
  );
};

export default InsightsTotalCard;
