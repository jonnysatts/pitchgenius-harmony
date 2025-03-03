
import React, { useState } from "react";
import { StrategicInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Flag, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface StrategicInsightCardProps {
  insight: StrategicInsight;
  reviewStatus?: 'accepted' | 'rejected' | 'pending';
  onAccept?: () => void;
  onReject?: () => void;
  onUpdate?: (content: Record<string, any>) => void;
}

const StrategicInsightCard: React.FC<StrategicInsightCardProps> = ({ 
  insight, 
  reviewStatus = 'pending',
  onAccept,
  onReject,
  onUpdate
}) => {
  const [expanded, setExpanded] = useState(false);

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
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <p className="text-slate-700 font-medium">{content.summary}</p>
        )}
        
        {expanded && (
          <>
            {content.details && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Detailed Analysis</h4>
                <p className="text-slate-600">{content.details}</p>
              </div>
            )}
            
            {content.evidence && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Supporting Evidence</h4>
                <p className="text-slate-600">{content.evidence}</p>
              </div>
            )}
            
            {content.impact && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Business Impact</h4>
                <p className="text-slate-600">{content.impact}</p>
              </div>
            )}
            
            {content.recommendations && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Strategic Recommendations</h4>
                <p className="text-slate-600">{content.recommendations}</p>
              </div>
            )}
            
            {content.dataPoints && Array.isArray(content.dataPoints) && content.dataPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Key Data Points</h4>
                <ul className="list-disc list-inside text-slate-600 ml-2">
                  {content.dataPoints.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {content.sources && Array.isArray(content.sources) && content.sources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Source Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {content.sources.map((source: any, index: number) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <FileText size={12} />
                      {source.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-center mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-slate-500 hover:text-slate-700"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Show More Details
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Determine if we should add review controls or show accepted/rejected status
  const showReviewControls = !!onAccept && !!onReject && reviewStatus === 'pending';

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
      </CardHeader>
      <CardContent>
        {renderContent()}
        
        {showReviewControls && onAccept && onReject && (
          <div className="flex justify-end mt-4 space-x-2">
            {onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate(insight.content)}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                Refine
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Reject
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onAccept}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategicInsightCard;
