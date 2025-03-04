
import { InsightCategory, StrategicInsight } from "@/lib/types";

/**
 * Validate and process insight categories to ensure they match expected enum values
 */
export const validateInsightCategory = (category: string): InsightCategory => {
  // Check if the category is a valid InsightCategory
  const validCategories = [
    'business_challenges',
    'audience_gaps',
    'competitive_threats',
    'gaming_opportunities',
    'strategic_recommendations',
    'key_narratives'
  ];
  
  if (validCategories.includes(category)) {
    return category as InsightCategory;
  }
  
  // Default to a valid category if needed
  console.warn(`Invalid insight category "${category}" - defaulting to "business_challenges"`);
  return 'business_challenges' as InsightCategory;
};

/**
 * Process insights from API response to ensure type safety
 */
export const processInsights = (insights: any[]): StrategicInsight[] => {
  return insights.map(insight => {
    return {
      ...insight,
      category: validateInsightCategory(insight.category),
      source: 'document'
    } as StrategicInsight;
  });
};
