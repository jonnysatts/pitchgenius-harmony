import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NoWebsiteCard from "./web-insights/NoWebsiteCard";
import WebsiteUrlCard from "./web-insights/WebsiteUrlCard";
import { FirecrawlApiKeyForm } from "./web-insights/FirecrawlApiKeyForm";
import WebInsightsHeader from "./web-insights/WebInsightsHeader";
import WebInsightsTabs from "./web-insights/WebInsightsTabs";
import AllInsightsTab from "./web-insights/AllInsightsTab";
import InsightCategoryTab from "./web-insights/InsightCategoryTab";
import WebsiteAnalysisControls from "./web-insights/WebsiteAnalysisControls";
import NoInsightsEmptyState from "./web-insights/NoInsightsEmptyState";
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";

interface WebInsightsTabContentProps {
  websiteUrl: string | undefined;
  isAnalyzingWebsite: boolean;
  insights: StrategicInsight[];
  error: string | null | undefined;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAnalyzeWebsite: () => void;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({
  websiteUrl,
  isAnalyzingWebsite,
  insights,
  error,
  activeTab,
  setActiveTab,
  handleAnalyzeWebsite
}) => {
  const hasInsights = insights && insights.length > 0;

  return (
    <div>
      <WebInsightsHeader />
      
      {!websiteUrl ? (
        <NoWebsiteCard />
      ) : (
        <>
          <WebsiteUrlCard websiteUrl={websiteUrl} />
          <FirecrawlApiKeyForm />
          <WebsiteAnalysisControls 
            isAnalyzingWebsite={isAnalyzingWebsite}
            onAnalyzeWebsite={handleAnalyzeWebsite}
          />

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
              <p>
                <strong>Analysis Error:</strong> {error}
              </p>
            </div>
          )}

          {hasInsights ? (
            <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
              <WebInsightsTabs />
              <TabsContent value="all" className="mt-2">
                <AllInsightsTab insights={insights} />
              </TabsContent>
              <TabsContent value="business_imperatives" className="mt-2">
                <InsightCategoryTab 
                  insights={insights} 
                  category="business_imperatives" 
                  categoryTitle="Business Imperatives"
                />
              </TabsContent>
              <TabsContent value="gaming_audience_opportunity" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="gaming_audience_opportunity"
                  categoryTitle="Gaming Audience Opportunity"
                />
              </TabsContent>
              <TabsContent value="strategic_activation_pathways" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="strategic_activation_pathways"
                  categoryTitle="Strategic Activation Pathways"
                />
              </TabsContent>
              <TabsContent value="company_positioning" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="company_positioning"
                  categoryTitle="Company Positioning"
                />
              </TabsContent>
              <TabsContent value="competitive_landscape" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="competitive_landscape"
                  categoryTitle="Competitive Landscape"
                />
              </TabsContent>
              <TabsContent value="key_partnerships" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="key_partnerships"
                  categoryTitle="Key Partnerships"
                />
              </TabsContent>
              <TabsContent value="public_announcements" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="public_announcements"
                  categoryTitle="Public Announcements"
                />
              </TabsContent>
               <TabsContent value="product_service_fit" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="product_service_fit"
                  categoryTitle="Product Service Fit"
                />
              </TabsContent>
              <TabsContent value="consumer_engagement" className="mt-2">
                <InsightCategoryTab
                  insights={insights}
                  category="consumer_engagement"
                  categoryTitle="Consumer Engagement"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <NoInsightsEmptyState />
          )}
        </>
      )}
    </div>
  );
};

export default WebInsightsTabContent;
