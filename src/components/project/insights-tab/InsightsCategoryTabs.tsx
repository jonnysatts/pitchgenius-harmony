
import React, { memo } from "react";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { StrategicInsight, InsightCategory } from "@/lib/types";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";

interface InsightsCategoryTabsProps {
  insightsByCategory: Record<InsightCategory, StrategicInsight[]>;
  categoriesWithInsights: InsightCategory[];
  getCategoryName: (category: InsightCategory) => string;
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const InsightsCategoryTabs: React.FC<InsightsCategoryTabsProps> = ({
  insightsByCategory,
  categoriesWithInsights,
  getCategoryName,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  return (
    <>
      <TabsContent value="all">
        <div className="space-y-6">
          {Object.entries(insightsByCategory).flatMap(([category, insights]) => 
            insights.map((insight) => (
              <StrategicInsightCard
                key={insight.id}
                insight={insight}
                reviewStatus={reviewedInsights[insight.id] || 'pending'}
                onAccept={() => onAcceptInsight(insight.id)}
                onReject={() => onRejectInsight(insight.id)}
                onUpdate={(updatedContent) => onUpdateInsight(insight.id, updatedContent)}
              />
            ))
          )}
        </div>
      </TabsContent>
      
      {categoriesWithInsights.map(category => (
        <TabsContent key={category} value={category}>
          <div className="space-y-6">
            {insightsByCategory[category].map((insight) => (
              <StrategicInsightCard
                key={insight.id}
                insight={insight}
                reviewStatus={reviewedInsights[insight.id] || 'pending'}
                onAccept={() => onAcceptInsight(insight.id)}
                onReject={() => onRejectInsight(insight.id)}
                onUpdate={(updatedContent) => onUpdateInsight(insight.id, updatedContent)}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </>
  );
};

export default memo(InsightsCategoryTabs);
