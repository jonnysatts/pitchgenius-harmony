
import { WebsiteInsightCategory } from '@/lib/types';

/**
 * Format the category name for display
 */
export const formatCategoryName = (category: string): string => {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Clean and normalize text content
 */
export const cleanTextContent = (text: string): string => {
  if (!text) return '';
  
  // Replace problematic sequences
  return text
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Generate a title for a specific category if one wasn't provided
 */
export const getCategoryTitle = (category: WebsiteInsightCategory): string => {
  switch (category) {
    case 'business_imperatives':
      return 'Critical Business Challenge: Gaming Audience Strategy';
    case 'gaming_audience_opportunity':
      return 'Strategic Gaming Audience Opportunity';
    case 'strategic_activation_pathways':
      return 'High-Impact Gaming Activation Strategy';
    default:
      return 'Strategic Gaming Insight';
  }
};

/**
 * Generate recommendations for a specific category if none were provided
 */
export const getCategoryRecommendation = (category: WebsiteInsightCategory): string => {
  switch (category) {
    case 'business_imperatives':
      return 'Games Age should develop a targeted gaming audience strategy that addresses this business challenge through authentic gaming audience engagement leveraging our Fortress venue network and industry partnerships.';
    case 'gaming_audience_opportunity':
      return 'Games Age should create an audience-first gaming strategy that connects this brand with relevant gaming communities through authentic experiences, content, and partnerships.';
    case 'strategic_activation_pathways':
      return 'Games Age should implement this strategic activation pathway with measurable KPIs, leveraging our Fortress venues, gaming partnerships, and experiential expertise to drive business results.';
    default:
      return 'Games Age should develop a strategic approach to connect this brand with gaming audiences in an authentic way that drives measurable business results.';
  }
};
