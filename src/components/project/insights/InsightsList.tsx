
import React from "react";
import { StrategicInsight } from "@/lib/types";
import StrategicInsightCard from "../StrategicInsightCard";

interface InsightsListProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const InsightsList: React.FC<InsightsListProps> = ({
  insights,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-lg">
        <p className="text-slate-500">No insights match the current filter</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights.map(insight => (
        <StrategicInsightCard
          key={insight.id}
          insight={{
            ...insight,
            // Ensure document insights don't show the website-derived label
            source: insight.source === 'document' ? 'document' : insight.source
          }}
          reviewStatus={reviewedInsights[insight.id] || 'pending'}
          onAccept={() => onAcceptInsight(insight.id)}
          onReject={() => onRejectInsight(insight.id)}
          onUpdate={(updates) => onUpdateInsight(insight.id, updates)}
        />
      ))}
    </div>
  );
};

export default InsightsList;
