
/**
 * Analytics and calculations for insights
 */
import { StrategicInsight } from "@/lib/types";

/**
 * Calculate the overall confidence score for insights
 * @returns A number between 0-100 representing average confidence
 */
export const calculateOverallConfidence = (insights: StrategicInsight[]): number => {
  if (!insights || !insights.length) return 0;
  
  // Filter out insights with zero confidence to avoid skewing the calculation
  const validInsights = insights.filter(insight => insight.confidence > 0);
  if (validInsights.length === 0) return 0;
  
  const total = validInsights.reduce((sum, insight) => sum + insight.confidence, 0);
  // Ensure we handle both percentage format (0-100) and decimal format (0-1)
  const average = total / validInsights.length;
  // Round to nearest integer
  return Math.round(average > 1 ? average : average * 100);
};

/**
 * Count insights that need review (low confidence)
 */
export const countInsightsNeedingReview = (insights: StrategicInsight[]): number => {
  if (!insights) return 0;
  return insights.filter(insight => insight.needsReview).length;
};
