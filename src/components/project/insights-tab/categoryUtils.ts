
import { InsightCategory, StrategicInsight } from "@/lib/types";

/**
 * Get a friendly display name for insight categories
 */
export const getCategoryName = (category: InsightCategory): string => {
  switch (category) {
    case "business_challenges": return "Business Challenges";
    case "audience_gaps": return "Audience Engagement";
    case "competitive_threats": return "Competitive Landscape";
    case "gaming_opportunities": return "Gaming Integration";
    case "strategic_recommendations": return "Strategic Recommendations";
    case "key_narratives": return "Cultural Insights";
    default: return category;
  }
};

/**
 * Group insights by their categories
 */
export const groupInsightsByCategory = (
  insights: StrategicInsight[]
): Record<InsightCategory, StrategicInsight[]> => {
  // Initialize with empty arrays for all categories
  const allCategories: InsightCategory[] = [
    "business_challenges",
    "audience_gaps",
    "competitive_threats",
    "gaming_opportunities",
    "strategic_recommendations",
    "key_narratives"
  ];
  
  const insightsByCategory: Record<InsightCategory, StrategicInsight[]> = {} as Record<InsightCategory, StrategicInsight[]>;
  
  // Initialize with empty arrays for all categories
  allCategories.forEach(category => {
    insightsByCategory[category] = [];
  });
  
  // Fill the categories with insights
  insights.forEach(insight => {
    if (insight.category) {
      if (!insightsByCategory[insight.category as InsightCategory]) {
        insightsByCategory[insight.category as InsightCategory] = [];
      }
      insightsByCategory[insight.category as InsightCategory].push(insight);
    }
  });
  
  return insightsByCategory;
};

/**
 * Get list of categories that have insights
 */
export const getCategoriesWithInsights = (
  insightsByCategory: Record<InsightCategory, StrategicInsight[]>
): InsightCategory[] => {
  return Object.entries(insightsByCategory)
    .filter(([_, insights]) => insights.length > 0)
    .map(([category]) => category as InsightCategory);
};
