
/**
 * Utility functions for formatting and displaying insights
 */

/**
 * Formats a category string into a readable title
 * @param category Category string with underscores
 * @returns Formatted category title with proper capitalization
 */
export const formatCategoryTitle = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Returns the appropriate text color class based on confidence level
 * @param confidence Confidence level (0-100)
 * @returns Tailwind CSS color class
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 85) return "text-green-600";
  if (confidence >= 70) return "text-amber-500";
  return "text-red-500";
};
