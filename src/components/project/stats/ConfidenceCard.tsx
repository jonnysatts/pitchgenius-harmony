
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
  // Define colors based on confidence level
  const getColorClass = () => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Overall Confidence</span>
          {usingFallbackInsights && (
            <span className="text-xs text-amber-500 ml-2 px-2 py-0.5 bg-amber-50 rounded-full">Fallback</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-2xl font-bold">{confidence}%</span>
          </div>
          <Progress 
            value={confidence} 
            className="h-2 w-full" 
            indicatorColor={getColorClass()}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfidenceCard;
