import React from "react";
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";

interface InsightCategoryTabProps {
  categoryInsights: StrategicInsight[];
  category: {
    id: string;
    label: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const InsightCategoryTab: React.FC<InsightCategoryTabProps> = ({
  categoryInsights,
  category,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          {category.icon && <category.icon className="mr-2 h-5 w-5 text-slate-500" />}
          {category.label}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
      </div>
      
      {categoryInsights.length > 0 ? (
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
      ) : (
        <div className="text-center py-6 border border-dashed rounded-md">
          <p className="text-slate-500">No insights in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default InsightCategoryTab;
