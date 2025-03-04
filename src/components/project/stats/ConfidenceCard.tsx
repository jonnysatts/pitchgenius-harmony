
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";

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

  // Define text color based on confidence level
  const getTextColorClass = () => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-amber-600";
    return "text-red-600";
  };

  // Get confidence label
  const getConfidenceLabel = () => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>AI Confidence</span>
          {usingFallbackInsights && (
            <span className="text-xs text-amber-500 ml-2 px-2 py-0.5 bg-amber-50 rounded-full flex items-center gap-1">
              <InfoIcon size={12} /> Fallback Data
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold">{confidence}%</span>
            <span className={`text-sm font-medium ${getTextColorClass()} px-3 py-1 rounded-full border ${confidence >= 80 ? 'border-green-200 bg-green-50' : confidence >= 60 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
              {getConfidenceLabel()}
            </span>
          </div>
          <Progress 
            value={confidence} 
            className="h-2.5 w-full bg-slate-100" 
            indicatorColor={getColorClass()}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfidenceCard;
