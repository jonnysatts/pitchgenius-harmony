import React from 'react';
import { StrategicInsight } from "@/lib/types";
import { formatCategoryTitle } from "@/utils/insightUtils";
import { groupInsightsByCategory } from "@/utils/insightUtils";

interface StrategicAnalysisViewProps {
  insights: StrategicInsight[];
}

export const StrategicAnalysisView: React.FC<StrategicAnalysisViewProps> = ({ insights }) => {
  // Group insights by category
  const groupedInsights = groupInsightsByCategory(insights);

  return (
    <div>
      {Object.keys(groupedInsights).length === 0 ? (
        <div className="text-gray-500 italic">No insights available.</div>
      ) : (
        Object.keys(groupedInsights).sort().map((category) => {
          // Replace the empty object with empty array where insights are initialized
          const categoryInsights = groupedInsights[category] || [];

          return (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{formatCategoryTitle(category)}</h3>
              {categoryInsights.length === 0 ? (
                <div className="text-gray-500 italic">No insights in this category.</div>
              ) : (
                <ul>
                  {categoryInsights.map((insight) => (
                    <li key={insight.id} className="mb-4 p-4 rounded-md shadow-sm border border-gray-200 bg-white">
                      <h4 className="font-medium">{insight.content.title}</h4>
                      <p className="text-sm text-gray-700">{insight.content.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
