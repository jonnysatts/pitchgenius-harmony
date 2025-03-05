
import React, { useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NoWebsiteCard from "./web-insights/NoWebsiteCard";
import WebsiteUrlCard from "./web-insights/WebsiteUrlCard";
import { WebInsightsHeader } from "./web-insights/WebInsightsHeader";
import WebInsightsTabs from "./web-insights/WebInsightsTabs";
import { NoInsightsEmptyState } from "./web-insights/NoInsightsEmptyState";
import { WebsiteAnalysisControls } from "./web-insights/WebsiteAnalysisControls";
import { WebsiteInsightCategory, StrategicInsight, AIProcessingStatus, Project } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
  // Check if we have actual insights (not just error placeholders)
  const hasRealInsights = useMemo(() => {
    if (!insights || insights.length === 0) return false;
    
    // Consider insights with error-related titles as not real
    const errorTitles = [
      "Improve Website Accessibility",
      "Website Accessibility Issue", 
      "Website Unavailable",
      "Prioritize Website Accessibility",
      "Unable to Assess",
      "Unable to Identify",
      "Unable to Evaluate",
      "Unable to Provide",
      "Placeholder Title"
    ];
    
    // If all insights have error titles, we don't have real insights
    const nonErrorInsights = insights.filter(insight => 
      !errorTitles.some(errorTitle => 
        insight.content?.title?.includes(errorTitle)
      )
    );
    
    return nonErrorInsights.length > 0;
  }, [insights]);
  
  const hasInsights = insights && insights.length > 0;
  const hasErrorInsights = hasInsights && !hasRealInsights;
  
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

  // Only show error in the main content area if we're not analyzing and we have error insights
  const shouldShowErrorBanner = error && !isAnalyzingWebsite && hasErrorInsights;

  return (
    <div>
      <WebInsightsHeader 
        websiteUrl={websiteUrl}
        hasWebsiteUrl={!!websiteUrl}
        isAnalyzing={isAnalyzingWebsite}
        onAnalyzeWebsite={handleAnalyzeWebsite}
        hasInsights={hasRealInsights}
        aiStatus={aiStatus}
      />
      
      {!websiteUrl ? (
        <NoWebsiteCard />
      ) : (
        <>
          <WebsiteUrlCard websiteUrl={websiteUrl} />
          
          {/* Only show analysis controls when actively analyzing */}
          {isAnalyzingWebsite && (
            <div className="mt-6">
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
                hasInsights={hasRealInsights}
                aiStatus={aiStatus}
                error={error}
              />
            </div>
          )}

          {shouldShowErrorBanner && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Website Analysis Failed</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
              <p className="mt-2 text-sm">
                Please try a different website URL or check the URL format. Common issues include website protection, CORS policies, or temporary site unavailability.
              </p>
            </Alert>
          )}

          {hasRealInsights ? (
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
              error={shouldShowErrorBanner ? error : null}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WebInsightsTabContent;
