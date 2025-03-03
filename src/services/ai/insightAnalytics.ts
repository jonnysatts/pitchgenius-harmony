
/**
 * Analytics and calculations for insights
 */
import { StrategicInsight } from "@/lib/types";

/**
 * Calculate the overall confidence score for insights
 * @returns A number between 0-100 representing average confidence
 */
export const calculateOverallConfidence = (insights: StrategicInsight[]): number => {
  if (!insights.length) return 0;
  
  const total = insights.reduce((sum, insight) => sum + insight.confidence, 0);
  return Math.round(total / insights.length);
};

/**
 * Count insights that need review (low confidence)
 */
export const countInsightsNeedingReview = (insights: StrategicInsight[]): number => {
  return insights.filter(insight => insight.needsReview).length;
};
