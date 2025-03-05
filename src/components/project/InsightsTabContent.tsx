
import React, { useState, useCallback, useEffect } from "react";
import { StrategicInsight, Project, AIProcessingStatus } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; 

// Import components from the correct path
import InsightsList from "@/components/project/insights/InsightsList";
import NoInsightsPlaceholder from "@/components/project/insights/NoInsightsPlaceholder";
import AnalysisLoadingState from "@/components/project/insights/AnalysisLoadingState";
import InsightsTabHeader from "@/components/project/insights-tab/InsightsTabHeader";

interface InsightsTabContentProps {
  project: Project;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error: string | null;
  aiStatus?: AIProcessingStatus;
  overallConfidence?: number;
  needsReviewCount?: number;
  pendingCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
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
  pendingCount = 0,
  acceptedCount = 0,
  rejectedCount = 0,
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
  
  const hasInsights = insights && insights.length > 0;
  const isAnalyzing = aiStatus && aiStatus.status === 'processing';
  
  // Log counts for debugging
  useEffect(() => {
    console.log(`InsightsTabContent: Total insights: ${insights.length}`);
    console.log(`InsightsTabContent: Using provided counts - Pending: ${pendingCount}, Accepted: ${acceptedCount}, Rejected: ${rejectedCount}`);
  }, [insights, pendingCount, acceptedCount, rejectedCount]);
  
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
    console.log(`InsightsTabContent: Applied filter '${activeFilter}', showing ${filtered.length} insights`);
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
        <div>
          <div className="bg-slate-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                <span className="text-sm font-medium text-slate-600">All:</span>
                <span className="ml-1.5 font-semibold text-slate-900">{insights.length}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                <span className="text-sm font-medium text-yellow-600">Pending:</span>
                <span className="ml-1.5 font-semibold text-yellow-700">{pendingCount}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                <span className="text-sm font-medium text-green-600">Accepted:</span>
                <span className="ml-1.5 font-semibold text-green-700">{acceptedCount}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                <span className="text-sm font-medium text-red-600">Rejected:</span>
                <span className="ml-1.5 font-semibold text-red-700">{rejectedCount}</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveFilter}>
            <TabsList className="mb-4 inline-flex h-10 w-full gap-1 rounded-md bg-slate-100 p-1">
              <TabsTrigger 
                value="all"
                className="flex-1 rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                All Insights
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="flex-1 rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Needs Review
              </TabsTrigger>
              <TabsTrigger 
                value="accepted"
                className="flex-1 rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Accepted
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="flex-1 rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Rejected
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
        </div>
      )}
    </div>
  );
};

export default InsightsTabContent;
