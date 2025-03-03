
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { formatCategoryTitle, getConfidenceColor } from "./utils/insightFormatters";

interface InsightCardHeaderProps {
  category: string;
  title?: string;
  confidence: number;
}

const InsightCardHeader: React.FC<InsightCardHeaderProps> = ({
  category,
  title,
  confidence
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <Badge 
          variant="outline" 
          className="mb-2 capitalize"
        >
          {formatCategoryTitle(category)}
        </Badge>
        <CardTitle className="text-lg">
          {title || formatCategoryTitle(category)}
        </CardTitle>
      </div>
      
      <div className="flex items-center">
        <span className={`flex items-center ${getConfidenceColor(confidence)}`}>
          {confidence >= 85 ? (
            <CheckCircle size={16} className="mr-1" />
          ) : confidence >= 70 ? (
            <></>
          ) : (
            <AlertTriangle size={16} className="mr-1" />
          )}
          {confidence}% confident
        </span>
      </div>
    </div>
  );
};

export default InsightCardHeader;
