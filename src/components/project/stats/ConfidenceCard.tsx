
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ConfidenceCardProps {
  confidence: number;
  usingFallbackInsights?: boolean;
}

const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidence,
  usingFallbackInsights = false
}) => {
  return (
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
  );
};

export default ConfidenceCard;
