
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
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus?.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  // Calculate stats
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  // Check if all insights have been reviewed (none are pending)
  const allInsightsReviewed = insights.length > 0 && 
    insights.every(insight => reviewedInsights[insight.id] === 'accepted' || reviewedInsights[insight.id] === 'rejected');
  
  // Handler for the Proceed to Presentation button
  const handleProceedToPresentation = () => {
    // Log a message before navigating
    console.log('Proceeding to presentation with:', { 
      acceptedInsights: acceptedCount,
      rejectedInsights: rejectedCount,
      totalInsights: insights.length
    });
    
    // Show a toast notification
    toast({
      title: "Proceeding to Presentation",
      description: `Building presentation with ${acceptedCount} strategic insights`,
    });
    
    // Navigate to the presentation tab
    onNavigateToPresentation();
  };

  // Handler for the viewMode value change that properly converts string to ViewMode enum
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <InsightsHeader 
        title="Strategic Insights" 
        showProceedButton={allInsightsReviewed && viewMode === ViewMode.NARRATIVE_FRAMEWORK}
        onProceedToPresentation={handleProceedToPresentation}
      />
      
      {/* Show error or fallback message if applicable */}
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
          {/* View Mode Selector with Progress Tracking */}
          <ViewModeSwitcher 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            insightsReviewed={allInsightsReviewed}
            insightCount={insights.length}
            acceptedCount={acceptedCount}
          />
          
          {/* Strategic Analysis View */}
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
          
          {/* Narrative Framework View */}
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
          
          {/* Bottom button for navigating to presentation */}
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
