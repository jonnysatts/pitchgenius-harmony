import { StrategicInsight, InsightCategory } from "@/lib/types";

// Correctly define NarrativeSection as interface
export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
}

/**
 * Format category string into readable title
 */
export const formatCategoryTitle = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Group insights by category
 */
export const groupInsightsByCategory = (
  insights: StrategicInsight[]
): Record<string, StrategicInsight[]> => {
  const groupedInsights: Record<string, StrategicInsight[]> = {};
  
  insights.forEach((insight) => {
    const category = insight.category;
    if (!groupedInsights[category]) {
      groupedInsights[category] = [];
    }
    groupedInsights[category].push(insight);
  });
  
  return groupedInsights;
};

/**
 * Generate a unique ID for insights
 */
export const generateInsightId = (): string => {
  return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

/**
 * Format a date as a string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

/**
 * Validate if an insight has all required fields
 */
export const isValidInsight = (insight: StrategicInsight): boolean => {
  return !!insight.id && !!insight.category && !!insight.content.title && !!insight.content.summary;
};
