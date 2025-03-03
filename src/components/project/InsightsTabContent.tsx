import React, { useState } from "react";
import { StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import InsightsStats from "@/components/project/InsightsStats";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsNavigation from "@/components/project/InsightsNavigation";
import ViewModeSwitcher, { ViewMode } from "@/components/project/insights/ViewModeSwitcher";
import StrategicAnalysisView from "@/components/project/insights/StrategicAnalysisView";
import NarrativeFrameworkView from "@/components/project/insights/NarrativeFrameworkView";
import InsightsHeader from "@/components/project/insights/InsightsHeader";
import { strategicCategories, narrativeSections } from "@/components/project/insights/constants";
import { Button } from "@/components/ui/button";
import { FileText, Globe } from "lucide-react";

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
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
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
  onUpdateInsight,
  onNavigateToDocuments,
  onNavigateToPresentation,
  onRetryAnalysis
}) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.STRATEGIC_ANALYSIS);
  
  const isClaudeProcessing = aiStatus?.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  const allInsightsReviewed = insights.length > 0 && 
    insights.every(insight => reviewedInsights[insight.id] === 'accepted' || reviewedInsights[insight.id] === 'rejected');
  
  const handleProceedToPresentation = () => {
    console.log('Proceeding to presentation with:', { 
      acceptedInsights: acceptedCount,
      rejectedInsights: rejectedCount,
      totalInsights: insights.length
    });
    
    toast({
      title: "Proceeding to Presentation",
      description: `Building presentation with ${acceptedCount} strategic insights`,
    });
    
    onNavigateToPresentation();
  };

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  const headerTitle = viewMode === ViewMode.STRATEGIC_ANALYSIS ? "Strategic Insights" : "Narrative Framework";

  return (
    <div className="bg-white p-6 rounded-lg border">
      <InsightsHeader 
        title={headerTitle}
        showProceedButton={allInsightsReviewed && viewMode === ViewMode.NARRATIVE_FRAMEWORK}
        onProceedToPresentation={handleProceedToPresentation}
      />
      
      <InsightsErrorAlert 
        error={error} 
        usingFallbackInsights={usingFallbackInsights}
        isClaudeProcessing={isClaudeProcessing}
        onRetryAnalysis={onRetryAnalysis} 
      />
      
      {insights.length === 0 ? (
        <InsightsEmptyState onNavigateToDocuments={onNavigateToDocuments} />
      ) : (
        <div className="mt-6">
          <ViewModeSwitcher 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            insightsReviewed={allInsightsReviewed}
            insightCount={insights.length}
            acceptedCount={acceptedCount}
          />
          
          {viewMode === ViewMode.STRATEGIC_ANALYSIS && (
            <StrategicAnalysisView 
              insights={insights}
              reviewedInsights={reviewedInsights}
              strategicCategories={strategicCategories}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          )}
          
          {viewMode === ViewMode.NARRATIVE_FRAMEWORK && (
            <NarrativeFrameworkView 
              insights={insights}
              reviewedInsights={reviewedInsights}
              narrativeSections={narrativeSections}
              strategicCategories={strategicCategories}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          )}
          
          <InsightsNavigation 
            showButton={allInsightsReviewed && viewMode === ViewMode.NARRATIVE_FRAMEWORK} 
            onNavigateToPresentation={handleProceedToPresentation} 
          />
        </div>
      )}
    </div>
  );
};

export default InsightsTabContent;
