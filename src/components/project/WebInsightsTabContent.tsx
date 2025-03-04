
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box } from "lucide-react";
import { Project, StrategicInsight } from "@/lib/types";
import ApiConnectionTest from "@/components/project/ApiConnectionTest";
import ClaudeApiTester from "@/components/project/ClaudeApiTester";
import WebsiteUrlCard from "@/components/project/web-insights/WebsiteUrlCard";
import NoWebsiteCard from "@/components/project/web-insights/NoWebsiteCard";
import WebInsightsTabs from "@/components/project/web-insights/WebInsightsTabs";
import { WebsiteAnalysisControls } from "@/components/project/web-insights/WebsiteAnalysisControls";
import { useWebsiteAnalysisState } from "@/hooks/ai/website";

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
          insightsByCategory={{}}
          reviewedInsights={reviewedInsights}
          onAcceptInsight={onAcceptInsight}
          onRejectInsight={onRejectInsight}
          onUpdateInsight={onUpdateInsight}
          totalInsightsCount={insights.length}
        />
      )}
    </div>
  );
};

export default WebInsightsTabContent;
