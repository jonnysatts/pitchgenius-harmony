
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface InsightCardContentProps {
  content: Record<string, any>;
}

const InsightCardContent: React.FC<InsightCardContentProps> = ({ content }) => {
  const [expanded, setExpanded] = useState(false);

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

export default InsightCardContent;
