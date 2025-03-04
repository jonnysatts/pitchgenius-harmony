/**
 * Factory for generating comprehensive mock insights
 */
import { Document, Project, StrategicInsight } from "@/lib/types";
import { generateDetailedInsight } from "./insightGenerator";

/**
 * Generate a comprehensive set of strategic insights
 */
export const generateComprehensiveInsights = (
  project: Project,
  documents: Document[]
): StrategicInsight[] => {
  const insights: StrategicInsight[] = [];
  
  // Generate a variety of insights across categories
  insights.push(generateDetailedInsight('business_challenges', project, documents));
  insights.push(generateDetailedInsight('audience_gaps', project, documents));
  insights.push(generateDetailedInsight('competitive_threats', project, documents));
  insights.push(generateDetailedInsight('gaming_opportunities', project, documents));
  insights.push(generateDetailedInsight('strategic_recommendations', project, documents));
  insights.push(generateDetailedInsight('key_narratives', project, documents));
  
  return insights;
};
