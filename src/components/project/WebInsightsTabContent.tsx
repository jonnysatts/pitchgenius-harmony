
import React, { useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NoWebsiteCard from "./web-insights/NoWebsiteCard";
import WebsiteUrlCard from "./web-insights/WebsiteUrlCard";
import { FirecrawlApiKeyForm } from "./web-insights/FirecrawlApiKeyForm";
import { WebInsightsHeader } from "./web-insights/WebInsightsHeader";
import WebInsightsTabs from "./web-insights/WebInsightsTabs";
import { NoInsightsEmptyState } from "./web-insights/NoInsightsEmptyState";
import { WebsiteAnalysisControls } from "./web-insights/WebsiteAnalysisControls";
import { WebsiteInsightCategory, StrategicInsight, AIProcessingStatus, Project } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";

interface WebInsightsTabContentProps {
  websiteUrl?: string;
  isAnalyzingWebsite: boolean;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error: string | null | undefined;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAnalyzeWebsite: () => void;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  aiStatus?: AIProcessingStatus;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({
  websiteUrl,
  isAnalyzingWebsite,
  insights,
  reviewedInsights,
  error,
  activeTab,
  setActiveTab,
  handleAnalyzeWebsite,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  aiStatus
}) => {
  const hasInsights = insights && insights.length > 0;
  
  // Organize insights by category
  const insightsByCategory = useMemo(() => {
    const categories = {} as Record<WebsiteInsightCategory, StrategicInsight[]>;
    
    // Initialize categories with empty arrays
    websiteInsightCategories.forEach(category => {
      categories[category.id as WebsiteInsightCategory] = [];
    });
    
    // Populate categories with insights
    insights.forEach(insight => {
      const category = insight.category as WebsiteInsightCategory;
      if (categories[category]) {
        categories[category].push(insight);
      }
    });
    
    return categories;
  }, [insights]);

  // Get filtered categories that have insights
  const filteredCategories = useMemo(() => {
    return websiteInsightCategories.filter(category => {
      const categoryId = category.id as WebsiteInsightCategory;
      return insightsByCategory[categoryId]?.length > 0;
    });
  }, [insightsByCategory]);

  return (
    <div>
      <WebInsightsHeader 
        websiteUrl={websiteUrl}
        hasWebsiteUrl={!!websiteUrl}
        isAnalyzing={isAnalyzingWebsite}
        onAnalyzeWebsite={handleAnalyzeWebsite}
        hasInsights={hasInsights}
        aiStatus={aiStatus}
      />
      
      {!websiteUrl ? (
        <NoWebsiteCard />
      ) : (
        <>
          <WebsiteUrlCard websiteUrl={websiteUrl} />
          <FirecrawlApiKeyForm />
          <WebsiteAnalysisControls 
            project={{
              id: '1',
              clientWebsite: websiteUrl,
              title: '',
              clientName: '',
              clientIndustry: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              ownerId: '',
              description: ''
            } as Project}
            isAnalyzing={isAnalyzingWebsite}
            onAnalyzeWebsite={handleAnalyzeWebsite}
            hasInsights={hasInsights}
            aiStatus={aiStatus}
          />

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
              <p>
                <strong>Analysis Error:</strong> {error}
              </p>
            </div>
          )}

          {hasInsights ? (
            <WebInsightsTabs
              insightsByCategory={insightsByCategory}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
              totalInsightsCount={insights.length}
              insights={insights}
            />
          ) : (
            <NoInsightsEmptyState 
              hasWebsiteUrl={!!websiteUrl}
              isAnalyzing={isAnalyzingWebsite}
              onAnalyzeWebsite={handleAnalyzeWebsite}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WebInsightsTabContent;
