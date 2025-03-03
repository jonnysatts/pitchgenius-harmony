
import React, { useState } from "react";
import { StrategicInsight, InsightCategory } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsCategoryGroup from "@/components/project/InsightsCategoryGroup";
import { groupInsightsByCategory } from "@/utils/insightUtils";

interface StrategicCategoryDefinition {
  id: InsightCategory;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface StrategicAnalysisViewProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  strategicCategories: StrategicCategoryDefinition[];
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const StrategicAnalysisView: React.FC<StrategicAnalysisViewProps> = ({
  insights,
  reviewedInsights,
  strategicCategories,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  const [activeSection, setActiveSection] = useState<string>("all_insights");
  const insightsByCategory = groupInsightsByCategory(insights);

  return (
    <Tabs defaultValue="all_insights" value={activeSection} onValueChange={setActiveSection}>
      <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
        <TabsTrigger value="all_insights" className="whitespace-nowrap">
          All Insights
        </TabsTrigger>
        {strategicCategories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="whitespace-nowrap"
          >
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* Display the description of the current category */}
      <div className="mb-6 px-4 py-3 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          {activeSection === "all_insights" 
            ? "Review all strategic insights across categories" 
            : strategicCategories.find(c => c.id === activeSection)?.description}
        </p>
      </div>
      
      <TabsContent value="all_insights" className="space-y-10">
        {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
          <InsightsCategoryGroup
            key={category}
            category={category}
            insights={categoryInsights}
            reviewedInsights={reviewedInsights}
            onAcceptInsight={onAcceptInsight}
            onRejectInsight={onRejectInsight}
            onUpdateInsight={onUpdateInsight}
            section="All Insights"
          />
        ))}
      </TabsContent>
      
      {/* Create a tab content for each category */}
      {strategicCategories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="space-y-10">
          {insightsByCategory[category.id] && insightsByCategory[category.id].length > 0 ? (
            <InsightsCategoryGroup
              key={category.id}
              category={category.id}
              insights={insightsByCategory[category.id]}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
              section={category.label}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No insights found for this category.</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default StrategicAnalysisView;
