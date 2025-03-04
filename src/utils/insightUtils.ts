import { StrategicInsight } from "@/lib/types";
// Remove the conflicting import
// import { NarrativeSection } from "@/lib/types";

// Make this the single declaration of NarrativeSection
export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
}

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
