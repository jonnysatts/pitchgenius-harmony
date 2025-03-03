
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
  
  // Generate 2-3 detailed insights per category (more comprehensive)
  const insights: StrategicInsight[] = [];
  
  categories.forEach(category => {
    // Increase to 3-4 insights per category for more comprehensive analysis
    const insightsCount = Math.floor(Math.random() * 2) + 3; // 3-4 insights per category
    
    for (let i = 0; i < insightsCount; i++) {
      insights.push(generateDetailedInsight(category, project, documents));
    }
  });
  
  console.log(`Generated ${insights.length} mock insights across ${categories.length} categories`);
  return insights;
};

