
import React from "react";
import { StrategicInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Lightbulb, Check, X, ArrowRight, AlertTriangle } from "lucide-react";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";
import InsightsStats from "@/components/project/InsightsStats";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InsightsTabContentProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  overallConfidence: number;
  needsReviewCount: number;
  error?: string | null;
  usingFallbackInsights?: boolean;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onNavigateToDocuments: () => void;
  onNavigateToPresentation: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  insights,
  reviewedInsights,
  overallConfidence,
  needsReviewCount,
  error,
  usingFallbackInsights,
  onAcceptInsight,
  onRejectInsight,
  onNavigateToDocuments,
  onNavigateToPresentation
}) => {
  // Group insights by category
  const insightsByCategory = insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
  
  // Calculate stats
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  // Check if all insights have been reviewed
  const allInsightsReviewed = insights.length > 0 && needsReviewCount === 0;
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Strategic Insights</h2>
        
        {allInsightsReviewed && (
          <Button 
            onClick={onNavigateToPresentation} 
            className="flex items-center gap-2"
          >
            Proceed to Presentation
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
      
      {/* Show error or fallback message if applicable */}
      {(error || usingFallbackInsights) && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || "Using sample insights due to API timeout. Please try again later for Claude AI analysis."}
          </AlertDescription>
        </Alert>
      )}
      
      {insights.length > 0 && (
        <InsightsStats 
          overallConfidence={overallConfidence}
          acceptedCount={acceptedCount}
          rejectedCount={rejectedCount}
          totalInsights={insights.length}
          needsReviewCount={needsReviewCount}
        />
      )}
      
      {insights.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-lg font-semibold text-slate-900">No insights yet</h3>
          <p className="mt-1 text-slate-500 max-w-md mx-auto">
            Upload documents and run the AI analysis to generate strategic insights for gaming opportunities
          </p>
          <Button 
            className="mt-4"
            onClick={onNavigateToDocuments}
          >
            Go to Documents
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize border-b pb-2">
                {category.replace(/_/g, ' ')}
              </h3>
              <div className="space-y-6">
                {categoryInsights.map(insight => (
                  <div key={insight.id} className="relative">
                    <div className={
                      reviewedInsights[insight.id] === 'rejected' 
                        ? 'opacity-50'
                        : ''
                    }>
                      <StrategicInsightCard insight={insight} />
                    </div>
                    
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant={reviewedInsights[insight.id] === 'accepted' ? "default" : "outline"}
                        className={
                          reviewedInsights[insight.id] === 'accepted' 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "border-green-500 text-green-500 hover:bg-green-50"
                        }
                        onClick={() => onAcceptInsight(insight.id)}
                      >
                        <Check size={16} />
                        <span className="ml-1">Accept</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={reviewedInsights[insight.id] === 'rejected' ? "default" : "outline"}
                        className={
                          reviewedInsights[insight.id] === 'rejected' 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "border-red-500 text-red-500 hover:bg-red-50"
                        }
                        onClick={() => onRejectInsight(insight.id)}
                      >
                        <X size={16} />
                        <span className="ml-1">Reject</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Bottom button for navigating to presentation */}
          {allInsightsReviewed && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={onNavigateToPresentation} 
                className="flex items-center gap-2"
                size="lg"
              >
                Proceed to Presentation
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightsTabContent;
