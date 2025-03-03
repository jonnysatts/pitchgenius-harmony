
import React from "react";
import { StrategicInsight, InsightCategory, NarrativeSection } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsCategoryGroup from "@/components/project/InsightsCategoryGroup";
import { groupInsightsByCategory, groupInsightsByNarrativeSection } from "@/utils/insightUtils";

interface NarrativeSectionDefinition {
  id: NarrativeSection;
  label: string;
  description: string;
  sourceCategories: InsightCategory[];
}

interface StrategicCategoryDefinition {
  id: InsightCategory;
  label: string;
  description?: string;
  icon?: React.ElementType;
}

interface NarrativeFrameworkViewProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  narrativeSections: NarrativeSectionDefinition[];
  strategicCategories: StrategicCategoryDefinition[];
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
}

const NarrativeFrameworkView: React.FC<NarrativeFrameworkViewProps> = ({
  insights,
  reviewedInsights,
  narrativeSections,
  strategicCategories,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight
}) => {
  const insightsByNarrativeSection = groupInsightsByNarrativeSection(insights, narrativeSections);

  return (
    <Tabs defaultValue={narrativeSections[0].id} className="space-y-4">
      <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
        {narrativeSections.map((section) => (
          <TabsTrigger 
            key={section.id} 
            value={section.id}
            className="whitespace-nowrap"
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {narrativeSections.map((section) => (
        <TabsContent key={section.id} value={section.id} className="space-y-6">
          <div className="mb-4 px-4 py-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Draws from:</strong> {section.sourceCategories.map(cat => 
                strategicCategories.find(c => c.id === cat)?.label
              ).join(", ")}
            </p>
          </div>
          
          {insightsByNarrativeSection[section.id] && insightsByNarrativeSection[section.id].length > 0 ? (
            // Group by original category within the narrative section
            Object.entries(
              groupInsightsByCategory(insightsByNarrativeSection[section.id])
            ).map(([category, categoryInsights]) => (
              <InsightsCategoryGroup
                key={`${section.id}-${category}`}
                category={category}
                insights={categoryInsights}
                reviewedInsights={reviewedInsights}
                onAcceptInsight={onAcceptInsight}
                onRejectInsight={onRejectInsight}
                onUpdateInsight={onUpdateInsight}
                section={section.label}
              />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No insights mapped to this narrative section yet.</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default NarrativeFrameworkView;
