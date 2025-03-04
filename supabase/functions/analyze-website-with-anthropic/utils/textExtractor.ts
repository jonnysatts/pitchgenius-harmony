
/**
 * Functions to extract insights from text responses
 */
import { cleanTextContent, extractSentences, formatCategoryName } from './textProcessingUtils';
import { getCategoryTitle, getCategoryRecommendation } from './defaultContentGenerators';

/**
 * Extract insights from text when JSON parsing fails
 */
export function extractInsightsFromText(text: string): any[] {
  try {
    // Look for patterns that indicate insights for different categories
    const categories = [
      'company_positioning',
      'competitive_landscape',
      'key_partnerships',
      'public_announcements',
      'consumer_engagement',
      'product_service_fit'
    ];
    
    const insights: any[] = [];
    
    for (const category of categories) {
      // Look for sections that mention this category
      const regex = new RegExp(`(${category}|${formatCategoryName(category)})([\\s\\S]*?)(?=(${categories.join('|')})|$)`, 'i');
      const match = text.match(regex);
      
      if (match) {
        const content = match[2];
        
        // Extract a title - look for phrases that might be titles
        const titleMatch = content.match(/title[:\s]+"([^"]+)"|"([^"]+)"|([A-Z][^.!?]+[.!?])/i);
        const title = titleMatch 
          ? (titleMatch[1] || titleMatch[2] || titleMatch[3]).trim() 
          : `Insight about ${formatCategoryName(category)}`;
        
        // Extract summary
        const summaryMatch = content.match(/summary[:\s]+"([^"]+)"|summary[:\s]+([^.!?]+[.!?])/i);
        const summary = summaryMatch 
          ? (summaryMatch[1] || summaryMatch[2]).trim() 
          : extractSentences(content, 1);
        
        // Extract details
        const detailsMatch = content.match(/details[:\s]+"([^"]+)"|details[:\s]+([^"]+?)(?=recommendations|$)/i);
        const details = detailsMatch 
          ? (detailsMatch[1] || detailsMatch[2]).trim() 
          : extractSentences(content, 3);
        
        // Extract recommendations
        const recommendationsMatch = content.match(/recommendations[:\s]+"([^"]+)"|recommendations[:\s]+([^"]+?)(?=\n\n|$)/i);
        let recommendations = recommendationsMatch 
          ? (recommendationsMatch[1] || recommendationsMatch[2]).trim() 
          : getCategoryRecommendation(category);
        
        // Replace "A gaming company" with "Games Age"
        recommendations = recommendations.replace(/A gaming company/g, 'Games Age');
        
        // Create the insight
        insights.push({
          id: `website-${category}-${Date.now()}`,
          category,
          confidence: Math.floor(Math.random() * 25) + 70, // Random between 70-94
          needsReview: true,
          content: {
            title: cleanTextContent(title) || getCategoryTitle(category),
            summary: `🌐 ${cleanTextContent(summary) || "Analysis from website content"}`, // Use only the globe icon
            details: cleanTextContent(details) || `Website analysis focused on ${category.replace(/_/g, ' ')}.`,
            recommendations: cleanTextContent(recommendations) || getCategoryRecommendation(category)
          }
        });
      }
    }
    
    // If we couldn't extract any insights, create at least one
    if (insights.length === 0) {
      const { generateFallbackInsights } = require('./defaultContentGenerators');
      return generateFallbackInsights("", "", "");
    }
    
    console.log(`Extracted ${insights.length} insights from text`);
    return insights;
  } catch (error) {
    console.error('Error extracting insights from text:', error);
    const { generateFallbackInsights } = require('./defaultContentGenerators');
    return generateFallbackInsights("", "", "");
  }
}
