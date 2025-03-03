
/**
 * Factory function for generating comprehensive mock insights
 */
import { Document, StrategicInsight, Project } from "@/lib/types";
import { generateDetailedInsight } from "./insightGenerator";

/**
 * Generate comprehensive mock insights for development/demo purposes
 */
export const generateComprehensiveInsights = (project: Project, documents: Document[]): StrategicInsight[] => {
  // Categories for insights
  const categories: Array<StrategicInsight['category']> = [
    "business_challenges",
    "audience_gaps",
    "competitive_threats",
    "gaming_opportunities",
    "strategic_recommendations",
    "key_narratives"
  ];
  
  // Generate 2-3 detailed insights per category
  const insights: StrategicInsight[] = [];
  
  categories.forEach(category => {
    const insightsCount = Math.floor(Math.random() * 2) + 2; // 2-3 insights per category
    
    for (let i = 0; i < insightsCount; i++) {
      insights.push(generateDetailedInsight(category, project, documents));
    }
  });
  
  return insights;
};
