
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Flag } from "lucide-react";
import { formatCategoryTitle, getConfidenceColor } from "./utils/insightFormatters";

interface InsightCardHeaderProps {
  category: string;
  title?: string;
  confidence: number;
  needsReview: boolean;
  reviewStatus: 'accepted' | 'rejected' | 'pending';
}

const InsightCardHeader: React.FC<InsightCardHeaderProps> = ({
  category,
  title,
  confidence,
  needsReview,
  reviewStatus
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
        
        {needsReview && (
          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-600 border-amber-200">
            <Flag size={12} className="mr-1" /> Needs Review
          </Badge>
        )}
        
        {reviewStatus === 'accepted' && (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
            <CheckCircle size={12} className="mr-1" /> Accepted
          </Badge>
        )}
        
        {reviewStatus === 'rejected' && (
          <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
            <AlertTriangle size={12} className="mr-1" /> Rejected
          </Badge>
        )}
      </div>
    </div>
  );
};

export default InsightCardHeader;
