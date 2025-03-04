
import React, { memo } from "react";
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";

interface AllInsightsTabProps {
  insightsByCategory: Record<WebsiteInsightCategory, StrategicInsight[]>;
  websiteInsightCategories: {
    id: string;
    label: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const AllInsightsTab: React.FC<AllInsightsTabProps> = ({
  insightsByCategory,
  websiteInsightCategories,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  return (
    <div className="space-y-8">
      {websiteInsightCategories.map((category) => {
        const categoryId = category.id as WebsiteInsightCategory;
        const categoryInsights = insightsByCategory[categoryId] || [];
        
        if (categoryInsights.length === 0) return null;
        
        return (
          <div key={category.id} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              {category.icon && <category.icon className="mr-2 h-5 w-5 text-slate-500" />}
              {category.label}
            </h3>
            <p className="text-sm text-slate-600 mb-4">{category.description}</p>
            <div className="space-y-4">
              {categoryInsights.map(insight => (
                <StrategicInsightCard
                  key={insight.id}
                  insight={insight}
                  reviewStatus={reviewedInsights[insight.id] || 'pending'}
                  onAccept={() => onAcceptInsight(insight.id)}
                  onReject={() => onRejectInsight(insight.id)}
                  onUpdate={(content) => onUpdateInsight(insight.id, content)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(AllInsightsTab);
