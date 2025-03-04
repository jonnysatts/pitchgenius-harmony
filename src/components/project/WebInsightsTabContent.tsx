
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box } from "lucide-react";
import { Project } from "@/lib/types";
import ApiConnectionTest from "@/components/project/ApiConnectionTest";
import ClaudeApiTester from "@/components/project/ClaudeApiTester";
import WebsiteUrlCard from "@/components/project/web-insights/WebsiteUrlCard";
import NoWebsiteCard from "@/components/project/web-insights/NoWebsiteCard";
import WebInsightsTabs from "@/components/project/web-insights/WebInsightsTabs";
import WebsiteAnalysisControls from "@/components/project/web-insights/WebsiteAnalysisControls";
import { useWebsiteAnalysis } from "@/hooks/ai/website";

interface WebInsightsTabContentProps {
  project: Project;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({ project }) => {
  const {
    websiteUrl,
    websiteInsights,
    analysisPhase,
    analysisError,
    startWebsiteAnalysis,
    isAnalyzing,
    hasWebsiteUrl
  } = useWebsiteAnalysis(project);

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
              onStartAnalysis={startWebsiteAnalysis}
              isAnalyzing={isAnalyzing}
              analysisPhase={analysisPhase}
              error={analysisError}
            />
          )}
        </div>
      </div>

      {websiteInsights.length > 0 && (
        <WebInsightsTabs insights={websiteInsights} />
      )}
    </div>
  );
};

export default WebInsightsTabContent;
