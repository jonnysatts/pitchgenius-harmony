
import React from "react";
import { StrategicInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Flag } from "lucide-react";

interface StrategicInsightCardProps {
  insight: StrategicInsight;
}

const StrategicInsightCard: React.FC<StrategicInsightCardProps> = ({ insight }) => {
  // Helper function to format the category into a readable title
  const formatCategoryTitle = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to get appropriate color for confidence level
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 85) return "text-green-600";
    if (confidence >= 70) return "text-amber-500";
    return "text-red-500";
  };

  // Helper to render content based on type
  const renderContent = () => {
    const content = insight.content;
    
    // Example content rendering - adjust based on your actual content structure
    return (
      <div className="space-y-2">
        {content.summary && (
          <p className="text-slate-700 font-medium">{content.summary}</p>
        )}
        
        {content.details && (
          <p className="text-slate-600">{content.details}</p>
        )}
        
        {content.points && Array.isArray(content.points) && (
          <ul className="list-disc list-inside text-slate-600 ml-2">
            {content.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Card className={insight.needsReview ? "border-amber-300" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge 
              variant="outline" 
              className="mb-2 capitalize"
            >
              {formatCategoryTitle(insight.category)}
            </Badge>
            <CardTitle className="text-lg">
              {insight.content.title || formatCategoryTitle(insight.category)}
            </CardTitle>
          </div>
          
          <div className="flex items-center">
            <span className={`flex items-center ${getConfidenceColor(insight.confidence)}`}>
              {insight.confidence >= 85 ? (
                <CheckCircle size={16} className="mr-1" />
              ) : insight.confidence >= 70 ? (
                <></>
              ) : (
                <AlertTriangle size={16} className="mr-1" />
              )}
              {insight.confidence}% confident
            </span>
            
            {insight.needsReview && (
              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-600 border-amber-200">
                <Flag size={12} className="mr-1" /> Needs Review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default StrategicInsightCard;
