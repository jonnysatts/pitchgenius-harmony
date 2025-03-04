
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box } from "lucide-react";
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import ApiConnectionTest from "@/components/project/ApiConnectionTest";
import ClaudeApiTester from "@/components/project/ClaudeApiTester";
import WebsiteUrlCard from "@/components/project/web-insights/WebsiteUrlCard";
import NoWebsiteCard from "@/components/project/web-insights/NoWebsiteCard";
import WebInsightsTabs from "@/components/project/web-insights/WebInsightsTabs";
import { WebsiteAnalysisControls } from "@/components/project/web-insights/WebsiteAnalysisControls";
import { useWebsiteAnalysisState } from "@/hooks/ai/website";
import { websiteInsightCategories } from "@/components/project/insights/constants";

interface WebInsightsTabContentProps {
  project: Project;
  websiteInsights?: StrategicInsight[];
  reviewedInsights?: Record<string, 'accepted' | 'rejected' | 'pending'>;
  isAnalyzingWebsite?: boolean;
  error?: string | null;
  onAnalyzeWebsite?: () => void;
  onAcceptInsight?: (insightId: string) => void;
  onRejectInsight?: (insightId: string) => void;
  onUpdateInsight?: (insightId: string, updatedContent: Record<string, any>) => void;
  onNavigateToInsights?: () => void;
  onRetryAnalysis?: () => void;
  aiStatus?: any;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({ 
  project,
  websiteInsights = [],
  reviewedInsights = {},
  isAnalyzingWebsite = false,
  error = null,
  onAnalyzeWebsite = () => {},
  onAcceptInsight = () => {},
  onRejectInsight = () => {},
  onUpdateInsight = () => {},
  onNavigateToInsights = () => {},
  onRetryAnalysis = () => {},
  aiStatus
}) => {
  const {
    isAnalyzing,
    websiteInsights: stateWebsiteInsights,
  } = useWebsiteAnalysisState();

  // Use either passed websiteInsights prop or the ones from state
  const insights = websiteInsights.length > 0 ? websiteInsights : stateWebsiteInsights;
  const hasWebsiteUrl = !!project.clientWebsite;
  const websiteUrl = project.clientWebsite || "";

  // Create a properly structured insightsByCategory object
  const categorizeInsights = () => {
    // Initialize with empty arrays for all categories
    const initialCategories: Record<WebsiteInsightCategory, StrategicInsight[]> = {
      business_imperatives: [],
      gaming_audience_opportunity: [],
      strategic_activation_pathways: [],
      company_positioning: [],
      competitive_landscape: [],
      key_partnerships: [],
      public_announcements: [],
      consumer_engagement: [],
      product_service_fit: []
    };
    
    // If no insights, return the empty structure
    if (!insights.length) return initialCategories;
    
    // Organize insights by category
    return insights.reduce((acc, insight) => {
      // Check if the insight category is a valid WebsiteInsightCategory
      if (Object.keys(initialCategories).includes(insight.category as string)) {
        const category = insight.category as WebsiteInsightCategory;
        acc[category].push(insight);
      } else {
        // If not a website category, put it in business_imperatives as a fallback
        acc.business_imperatives.push(insight);
      }
      return acc;
    }, {...initialCategories});
  };

  const insightsByCategory = categorizeInsights();

  return (
    <div className="pt-4 space-y-4">
      <div className="lg:flex justify-between items-start">
        <div className="w-full lg:w-2/3 lg:pr-4">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Box className="mr-2 h-5 w-5" />
            Website Analysis
          </h2>
          
          {/* Added Claude API Tester component */}
          <ClaudeApiTester />
          
          {hasWebsiteUrl ? (
            <WebsiteUrlCard websiteUrl={websiteUrl} />
          ) : (
            <NoWebsiteCard />
          )}
        </div>
        
        <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
          <ApiConnectionTest />
          {hasWebsiteUrl && (
            <WebsiteAnalysisControls
              project={project}
              isAnalyzing={isAnalyzingWebsite || isAnalyzing}
              onAnalyzeWebsite={onAnalyzeWebsite}
              hasInsights={insights.length > 0}
              aiStatus={aiStatus}
            />
          )}
        </div>
      </div>

      {insights.length > 0 && (
        <WebInsightsTabs
          insightsByCategory={insightsByCategory}
          reviewedInsights={reviewedInsights}
          onAcceptInsight={onAcceptInsight}
          onRejectInsight={onRejectInsight}
          onUpdateInsight={onUpdateInsight}
          totalInsightsCount={insights.length}
          insights={insights}
        />
      )}
    </div>
  );
};

export default WebInsightsTabContent;
