
/**
 * Functions to validate and fix insight data
 */
import { cleanTextContent } from './textProcessingUtils';
import { getCategoryTitle, getCategoryRecommendation } from './defaultContentGenerators';

// Valid website insight categories
const validCategories = [
  'company_positioning', 'competitive_landscape', 'key_partnerships',
  'public_announcements', 'consumer_engagement', 'product_service_fit'
];

/**
 * Validate and fix an insight to ensure it has all required fields
 * Adds proper defensive measures against malformed data
 */
export function validateAndFixInsight(insight: any): any {
  // Generate a proper ID if missing or invalid
  const id = typeof insight.id === 'string' && insight.id.length > 0 
    ? insight.id 
    : `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Ensure category is one of the valid options
  const category = typeof insight.category === 'string' && 
                  validCategories.includes(insight.category)
    ? insight.category
    : validCategories[Math.floor(Math.random() * validCategories.length)];
  
  // Ensure content fields are properly formatted
  const title = typeof insight.content?.title === 'string' && insight.content.title.length > 0
    ? cleanTextContent(insight.content.title)
    : getCategoryTitle(category);
  
  const summary = typeof insight.content?.summary === 'string' && insight.content.summary.length > 0
    ? cleanTextContent(insight.content.summary)
    : `Analysis of website content for ${category.replace(/_/g, ' ')}`;
  
  const details = typeof insight.content?.details === 'string' && insight.content.details.length > 0
    ? cleanTextContent(insight.content.details)
    : `Website analysis focused on ${category.replace(/_/g, ' ')}.`;
  
  // Get recommendations and replace "A gaming company" with "Games Age"
  let recommendations = typeof insight.content?.recommendations === 'string' && 
                         insight.content.recommendations.length > 0
    ? cleanTextContent(insight.content.recommendations)
    : getCategoryRecommendation(category);
  
  // Replace "A gaming company" with "Games Age"
  recommendations = recommendations.replace(/A gaming company/g, 'Games Age');
  
  return {
    id,
    category,
    confidence: typeof insight.confidence === 'number' ? insight.confidence : 75,
    needsReview: typeof insight.needsReview === 'boolean' ? insight.needsReview : true,
    content: {
      title,
      summary: `🌐 ${summary}`, // Use only the globe icon
      details,
      recommendations
    }
  };
}

/**
 * Process insights to ensure they have all required fields
 */
export function processInsights(insights: any[], websiteUrl: string, clientName: string): any[] {
  const { generateFallbackInsights } = require('./defaultContentGenerators');
  
  if (!insights || insights.length === 0) {
    return generateFallbackInsights(websiteUrl, clientName, "");
  }
  
  return insights.map((insight: any) => {
    // Ensure the insight has all required fields
    return validateAndFixInsight(insight);
  });
}
