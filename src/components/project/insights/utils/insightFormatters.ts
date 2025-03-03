
/**
 * Utility functions for formatting and displaying insights
 */

import { WebsiteInsightCategory } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";

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

/**
 * Maps API response categories to our defined website insight categories
 * This helps normalize different naming conventions from API responses
 * @param apiCategory The category string from the API response
 * @returns A valid WebsiteInsightCategory
 */
export const normalizeWebsiteCategory = (apiCategory: string): WebsiteInsightCategory => {
  // Define mappings from common API response categories to our defined categories
  const categoryMappings: Record<string, WebsiteInsightCategory> = {
    // Direct mappings (when API uses our exact category names)
    'company_positioning': 'company_positioning',
    'competitive_landscape': 'competitive_landscape',
    'key_partnerships': 'key_partnerships',
    'public_announcements': 'public_announcements',
    'consumer_engagement': 'consumer_engagement',
    'product_service_fit': 'product_service_fit',
    
    // Alternative names that might come from the API
    'audience': 'consumer_engagement',
    'brand': 'company_positioning',
    'positioning': 'company_positioning',
    'competition': 'competitive_landscape',
    'competitors': 'competitive_landscape',
    'market': 'competitive_landscape',
    'partners': 'key_partnerships',
    'partnerships': 'key_partnerships',
    'alliances': 'key_partnerships',
    'news': 'public_announcements',
    'announcements': 'public_announcements',
    'updates': 'public_announcements',
    'engagement': 'consumer_engagement',
    'customers': 'consumer_engagement',
    'users': 'consumer_engagement',
    'digital': 'consumer_engagement',
    'social': 'consumer_engagement',
    'product': 'product_service_fit',
    'service': 'product_service_fit',
    'gaming': 'product_service_fit',
    'integration': 'product_service_fit',
    'opportunity': 'product_service_fit',
    'strategy': 'company_positioning'
  };
  
  // Lowercase and trim the category for consistent matching
  const normalizedCategory = apiCategory.toLowerCase().trim();
  
  // Check if we have a direct mapping
  if (categoryMappings[normalizedCategory]) {
    return categoryMappings[normalizedCategory];
  }
  
  // If no direct match, check if the category contains any of our keywords
  for (const [keyword, mappedCategory] of Object.entries(categoryMappings)) {
    if (normalizedCategory.includes(keyword)) {
      return mappedCategory;
    }
  }
  
  // Default to company_positioning if no match found
  console.warn(`No category mapping found for "${apiCategory}", defaulting to company_positioning`);
  return 'company_positioning';
};

/**
 * Checks if a category is a valid WebsiteInsightCategory
 * @param category The category to check
 * @returns Boolean indicating if it's a valid category
 */
export const isValidWebsiteCategory = (category: string): boolean => {
  return websiteInsightCategories.some(cat => cat.id === category);
};
