
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
  insights?: StrategicInsight[];
}

const WebInsightsTabs: React.FC<WebInsightsTabsProps> = ({
  insightsByCategory,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  totalInsightsCount,
  insights = []
}) => {
  // Filter websiteInsightCategories to only show categories that have insights
  const filteredCategories = websiteInsightCategories.filter(category => {
    const categoryId = category.id as WebsiteInsightCategory;
    return insightsByCategory[categoryId]?.length > 0;
  });

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600 mb-2">
        <span className="font-medium">{totalInsightsCount}</span> insights generated from website analysis
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <div className="bg-slate-50 rounded-lg mb-6 p-1.5 border border-slate-200">
          <TabsList className="w-full h-auto p-1 bg-transparent flex overflow-x-auto no-scrollbar gap-1">
            <TabsTrigger 
              value="all" 
              className="text-sm font-medium rounded-md py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              All Categories
            </TabsTrigger>
            {filteredCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="text-sm font-medium rounded-md py-2.5 px-4 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <AllInsightsTab
            insightsByCategory={insightsByCategory}
            websiteInsightCategories={filteredCategories}
            reviewedInsights={reviewedInsights}
            onAcceptInsight={onAcceptInsight}
            onRejectInsight={onRejectInsight}
            onUpdateInsight={onUpdateInsight}
          />
        </TabsContent>
        
        {filteredCategories.map((category) => {
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
