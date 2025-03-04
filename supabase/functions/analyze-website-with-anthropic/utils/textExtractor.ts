
/**
 * Extract insights from text when JSON parsing fails
 */
import { cleanTextContent } from './textProcessingUtils.ts';

/**
 * Extract insights from Claude's text response if JSON parsing fails
 */
export function extractInsightsFromText(text: string): any[] {
  console.log('Extracting insights from text response');
  
  const insights = [];
  const timestamp = Date.now();
  
  // Extract section blocks based on potential headers or separators
  const categoryPatterns = [
    { regex: /company[_\s]positioning|brand[_\s]positioning|positioning/i, category: 'company_positioning' },
    { regex: /competitive[_\s]landscape|competitors|market[_\s]position/i, category: 'competitive_landscape' },
    { regex: /key[_\s]partnerships|partnerships|alliances|partners/i, category: 'key_partnerships' },
    { regex: /public[_\s]announcements|announcements|news|recent[_\s]developments/i, category: 'public_announcements' },
    { regex: /consumer[_\s]engagement|customer[_\s]engagement|engagement/i, category: 'consumer_engagement' },
    { regex: /product[_\s]service[_\s]fit|service[_\s]offerings|products|product[_\s]fit/i, category: 'product_service_fit' }
  ];
  
  // Split text by sections with headers
  const sections = text.split(/\n\s*(?:#+\s*|\d+\.\s*|[A-Z][A-Za-z ]+:)\s*/);
  
  for (const section of sections) {
    if (section.trim().length < 50) continue; // Skip very short sections
    
    // Attempt to determine the category from the content
    let category = 'company_positioning'; // Default category
    let highestScore = 0;
    
    for (const pattern of categoryPatterns) {
      const matches = section.match(pattern.regex);
      if (matches && matches.length > highestScore) {
        highestScore = matches.length;
        category = pattern.category;
      }
    }
    
    // Extract potential title (first line or sentence)
    const titleMatch = section.match(/^(.+?)[\.\n]/);
    const title = titleMatch 
      ? cleanTextContent(titleMatch[1]) 
      : `${category.replace(/_/g, ' ')} Analysis`;
    
    // Extract sentences for summary and details
    const sentences = section.split(/(?<=\.)\s+/);
    const summary = sentences.length > 0 
      ? cleanTextContent(sentences[0]) 
      : `Analysis of ${category.replace(/_/g, ' ')}`;
    
    const details = sentences.length > 1 
      ? cleanTextContent(sentences.slice(1, 5).join(' ')) 
      : `Website analysis focused on ${category.replace(/_/g, ' ')}.`;
    
    // Look for recommendations in the text
    const recommendationMatch = section.match(/recommend(?:ation)?s?:?\s*([^\.]+\.[^\.]+\.)/i);
    const recommendations = recommendationMatch 
      ? cleanTextContent(recommendationMatch[1]) 
      : `Games Age should consider the ${category.replace(/_/g, ' ')} when developing gaming strategies.`;
    
    // Build the insight object
    insights.push({
      id: `website-${category}-${timestamp}-${insights.length + 1}`,
      category,
      confidence: 70, // Lower confidence since this is extracted from text
      needsReview: true,
      content: {
        title,
        summary,
        details,
        recommendations
      }
    });
  }
  
  console.log(`Extracted ${insights.length} insights from text`);
  
  // If we couldn't extract anything, get the entire text and categorize it
  if (insights.length === 0) {
    insights.push({
      id: `website-fallback-${timestamp}`,
      category: 'company_positioning', // Default to this category
      confidence: 60,
      needsReview: true,
      content: {
        title: 'Website Analysis',
        summary: cleanTextContent(text.substring(0, 150)),
        details: cleanTextContent(text.substring(0, 500)),
        recommendations: 'Games Age should conduct further analysis to develop more specific gaming strategy recommendations.'
      }
    });
  }
  
  return insights;
}
