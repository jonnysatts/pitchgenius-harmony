import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import AllInsightsTab from "./AllInsightsTab";
import InsightCategoryTab from "./InsightCategoryTab";

interface WebInsightsTabsProps {
  insightsByCategory: Record<WebsiteInsightCategory, StrategicInsight[]>;
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  totalInsightsCount: number;
}

const WebInsightsTabs: React.FC<WebInsightsTabsProps> = ({
  insightsByCategory,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  totalInsightsCount
}) => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600 mb-2">
        <span className="font-medium">{totalInsightsCount}</span> insights generated from website analysis
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full overflow-x-auto flex flex-nowrap">
          <TabsTrigger value="all" className="whitespace-nowrap">
            All Categories
          </TabsTrigger>
          {websiteInsightCategories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="whitespace-nowrap"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <AllInsightsTab
            insightsByCategory={insightsByCategory}
            websiteInsightCategories={websiteInsightCategories}
            reviewedInsights={reviewedInsights}
            onAcceptInsight={onAcceptInsight}
            onRejectInsight={onRejectInsight}
            onUpdateInsight={onUpdateInsight}
          />
        </TabsContent>
        
        {websiteInsightCategories.map((category) => {
          const categoryId = category.id as WebsiteInsightCategory;
          const categoryInsights = insightsByCategory[categoryId] || [];
          
          return (
            <TabsContent key={category.id} value={category.id}>
              <InsightCategoryTab
                categoryInsights={categoryInsights}
                category={category}
                reviewedInsights={reviewedInsights}
                onAcceptInsight={onAcceptInsight}
                onRejectInsight={onRejectInsight}
                onUpdateInsight={onUpdateInsight}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default WebInsightsTabs;
