
import React from "react";
import { StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import InsightsStats from "@/components/project/InsightsStats";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsCategoryGroup from "@/components/project/InsightsCategoryGroup";
import InsightsNavigation from "@/components/project/InsightsNavigation";
import { useToast } from "@/hooks/use-toast";

interface InsightsTabContentProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  overallConfidence: number;
  needsReviewCount: number;
  error?: string | null;
  usingFallbackInsights?: boolean;
  aiStatus?: AIProcessingStatus;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onNavigateToDocuments: () => void;
  onNavigateToPresentation: () => void;
  onRetryAnalysis?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  insights,
  reviewedInsights,
  overallConfidence,
  needsReviewCount,
  error,
  usingFallbackInsights,
  aiStatus,
  onAcceptInsight,
  onRejectInsight,
  onNavigateToDocuments,
  onNavigateToPresentation,
  onRetryAnalysis
}) => {
  const { toast } = useToast();
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus?.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
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
  
  // Check if all insights have been reviewed (none are pending)
  const allInsightsReviewed = insights.length > 0 && 
    Object.values(reviewedInsights).every(status => status === 'accepted' || status === 'rejected');
  
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
      <InsightsErrorAlert 
        error={error} 
        usingFallbackInsights={usingFallbackInsights}
        isClaudeProcessing={isClaudeProcessing}
        onRetryAnalysis={onRetryAnalysis} 
      />
      
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
        <InsightsEmptyState onNavigateToDocuments={onNavigateToDocuments} />
      ) : (
        <div className="space-y-10">
          {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
            <InsightsCategoryGroup
              key={category}
              category={category}
              insights={categoryInsights}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
            />
          ))}
          
          {/* Bottom button for navigating to presentation */}
          <InsightsNavigation 
            showButton={allInsightsReviewed} 
            onNavigateToPresentation={onNavigateToPresentation} 
          />
        </div>
      )}
    </div>
  );
};

export default InsightsTabContent;
