
import React from "react";
import { Project, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { Tabs } from "@/components/ui/tabs";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsStats from "@/components/project/InsightsStats";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import { 
  InsightsTabHeader, 
  InsightsCategoryNav, 
  InsightsCategoryTabs,
  groupInsightsByCategory,
  getCategoriesWithInsights,
  getCategoryName
} from "@/components/project/insights-tab";

interface InsightsTabContentProps {
  project: Project;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error?: string | null;
  overallConfidence?: number;
  needsReviewCount?: number;
  usingFallbackInsights?: boolean;
  aiStatus?: AIProcessingStatus;
  insufficientContent?: boolean;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onNavigateToDocuments?: () => void;
  onNavigateToPresentation?: () => void;
  onNavigateToWebInsights?: () => void;
  onRetryAnalysis?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  project,
  insights,
  reviewedInsights,
  error,
  overallConfidence = 0,
  needsReviewCount = 0,
  usingFallbackInsights = false,
  aiStatus,
  insufficientContent = false,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  onNavigateToDocuments,
  onNavigateToPresentation,
  onNavigateToWebInsights,
  onRetryAnalysis
}) => {
  // Only show document insights, not website insights
  const documentInsights = insights.filter(insight => insight.source === 'document');
  const hasInsights = documentInsights.length > 0;
  
  // Only set as fallback insights for display if there are insights and the flag is true
  const showingFallbackInsights = hasInsights && usingFallbackInsights;
  
  // Filter for document-specific error messages (that don't mention websites)
  const docError = error && !error.includes('website') ? error : null;
  
  // Count the insights that have been accepted
  const acceptedCount = documentInsights.filter(
    insight => reviewedInsights[insight.id] === 'accepted'
  ).length;

  // Group insights by category and get categories with insights
  const insightsByCategory = groupInsightsByCategory(documentInsights);
  const categoriesWithInsights = getCategoriesWithInsights(insightsByCategory);
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <InsightsTabHeader 
        hasInsights={hasInsights} 
        onRetryAnalysis={onRetryAnalysis} 
      />
      
      <InsightsErrorAlert 
        error={docError} 
        onRetryAnalysis={onRetryAnalysis}
      />
      
      {hasInsights && (
        <div className="mb-6">
          <InsightsStats
            insightCount={documentInsights.length}
            acceptedCount={acceptedCount}
            needsReviewCount={needsReviewCount || 0}
            confidence={overallConfidence}
            usingFallbackInsights={showingFallbackInsights}
          />
        </div>
      )}
      
      {hasInsights ? (
        <div>
          <Tabs defaultValue="all" className="w-full">
            <InsightsCategoryNav 
              categoriesWithInsights={categoriesWithInsights} 
              getCategoryName={getCategoryName} 
            />
            
            <InsightsCategoryTabs 
              insightsByCategory={insightsByCategory}
              categoriesWithInsights={categoriesWithInsights}
              getCategoryName={getCategoryName}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          </Tabs>
        </div>
      ) : (
        <InsightsEmptyState 
          onNavigateToDocuments={onNavigateToDocuments}
          onRetryAnalysis={onRetryAnalysis}
          onAnalyzeWebsite={onNavigateToWebInsights}
          insufficientContent={insufficientContent}
        />
      )}
    </div>
  );
};

export default InsightsTabContent;
