
import { StrategicInsight, InsightCategory, NarrativeSection } from "@/lib/types";

/**
 * Groups insights by their category
 */
export const groupInsightsByCategory = (insights: StrategicInsight[]): Record<string, StrategicInsight[]> => {
  return insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
};

/**
 * Groups insights by narrative section based on their category
 */
export const groupInsightsByNarrativeSection = (
  insights: StrategicInsight[], 
  narrativeSections: {id: NarrativeSection, sourceCategories: InsightCategory[]}[]
): Record<string, StrategicInsight[]> => {
  return insights.reduce((sections, insight) => {
    // Find matching narrative sections based on insight category
    const matchingSections = narrativeSections.filter(section => 
      section.sourceCategories.includes(insight.category as InsightCategory)
    );
    
    // Add the insight to each matching section
    matchingSections.forEach(section => {
      if (!sections[section.id]) {
        sections[section.id] = [];
      }
      sections[section.id].push(insight);
    });
    
    return sections;
  }, {} as Record<string, StrategicInsight[]>);
};

/**
 * Format category string into readable title
 */
export const formatCategoryTitle = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
