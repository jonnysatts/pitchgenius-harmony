
import React, { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategicInsight, Project, AIProcessingStatus } from "@/lib/types";
import InsightsList from "./insights/InsightsList";
import NoInsightsPlaceholder from "./insights/NoInsightsPlaceholder";
import AnalysisLoadingState from "./insights/AnalysisLoadingState";
import InsightsTabHeader from "./insights-tab/InsightsTabHeader";
import { useQueryClient } from "@tanstack/react-query";

interface InsightsTabContentProps {
  project: Project;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error: string | null;
  aiStatus?: AIProcessingStatus;
  overallConfidence?: number;
  needsReviewCount?: number;
  usingFallbackInsights?: boolean;
  onNavigateToWebInsights?: () => void;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onRetryAnalysis?: () => void;
  onRefreshInsights?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  project,
  insights,
  reviewedInsights,
  error,
  aiStatus,
  overallConfidence = 0,
  needsReviewCount = 0,
  usingFallbackInsights = false,
  onNavigateToWebInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  onRetryAnalysis,
  onRefreshInsights
}) => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [renderedInsights, setRenderedInsights] = useState<StrategicInsight[]>([]);
  
  // Calculate review counts correctly
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  // Calculate the actual needs review count based on the insights array
  const actualNeedsReviewCount = insights.filter(insight => 
    !reviewedInsights[insight.id] || reviewedInsights[insight.id] === 'pending'
  ).length;
  
  const hasInsights = insights && insights.length > 0;
  const isAnalyzing = aiStatus && aiStatus.status === 'processing';
  
  const handleRefreshInsights = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['project', project.id, 'insights']
    });
    
    setRenderedInsights([...insights]);
    
    if (onRefreshInsights) {
      onRefreshInsights();
    }
    
    console.log('Manually refreshed insights view');
  }, [queryClient, project.id, insights, onRefreshInsights]);
  
  useEffect(() => {
    if (!insights) {
      setRenderedInsights([]);
      return;
    }
    
    let filtered = [...insights];
    
    if (activeFilter === "pending") {
      filtered = filtered.filter(insight => 
        !reviewedInsights[insight.id] || reviewedInsights[insight.id] === 'pending'
      );
    } else if (activeFilter === "accepted") {
      filtered = filtered.filter(insight => 
        reviewedInsights[insight.id] === 'accepted'
      );
    } else if (activeFilter === "rejected") {
      filtered = filtered.filter(insight => 
        reviewedInsights[insight.id] === 'rejected'
      );
    }
    
    setRenderedInsights(filtered);
  }, [insights, activeFilter, reviewedInsights]);
  
  return (
    <div className="space-y-6">
      <InsightsTabHeader 
        hasInsights={hasInsights} 
        onRetryAnalysis={onRetryAnalysis}
        onRefreshInsights={handleRefreshInsights}
      />
      
      {isAnalyzing && (
        <AnalysisLoadingState aiStatus={aiStatus} />
      )}
      
      {error && !isAnalyzing && (
        <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 font-medium">{error}</p>
          
          {usingFallbackInsights && (
            <p className="text-amber-700 text-sm mt-1">
              Using sample insights instead. For real AI analysis, please check your connection and API settings.
            </p>
          )}
        </div>
      )}
      
      {!hasInsights && !isAnalyzing && (
        <NoInsightsPlaceholder 
          error={error}
          onNavigateToWebInsights={onNavigateToWebInsights}
          onRetryAnalysis={onRetryAnalysis}
        />
      )}
      
      {hasInsights && !isAnalyzing && (
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Insights ({insights.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Needs Review ({actualNeedsReviewCount})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <InsightsList 
              insights={renderedInsights}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <InsightsList 
              insights={renderedInsights}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          </TabsContent>
          
          <TabsContent value="accepted" className="mt-0">
            <InsightsList 
              insights={renderedInsights}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            <InsightsList 
              insights={renderedInsights}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default InsightsTabContent;
