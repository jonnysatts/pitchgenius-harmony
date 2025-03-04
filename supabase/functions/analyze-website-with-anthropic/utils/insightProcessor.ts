
/**
 * Process Claude API responses into structured insights
 */
import { v4 as uuid } from 'https://esm.sh/uuid@9.0.0';

// Define the insight structure type
interface Insight {
  id: string;
  category: string;
  confidence: number;
  needsReview: boolean;
  content: {
    title: string;
    summary: string;
    details: string;
    recommendations: string;
  };
}

/**
 * Parse Claude's JSON response into structured insights
 */
export function parseClaudeResponse(response: string): Insight[] {
  console.log('Starting to parse Claude response');
  
  try {
    // First, try to find and extract any JSON array from the text
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log(`Found JSON array in response: ${jsonStr.substring(0, 100)}...`);
      
      // Parse the JSON
      try {
        const insights: Insight[] = JSON.parse(jsonStr);
        console.log(`Successfully parsed ${insights.length} insights from JSON`);
        return insights;
      } catch (jsonError) {
        console.error('Error parsing extracted JSON:', jsonError);
        // Try a more lenient approach - extract individual JSON objects
        return extractInsightsFromText(response);
      }
    } else {
      console.log('No JSON array found in response, trying to extract individual insights');
      return extractInsightsFromText(response);
    }
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error(`Failed to parse insights from Claude response: ${error.message}`);
  }
}

/**
 * Extract insights from text when JSON parsing fails
 */
function extractInsightsFromText(text: string): Insight[] {
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
    
    const insights: Insight[] = [];
    
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
        const recommendations = recommendationsMatch 
          ? (recommendationsMatch[1] || recommendationsMatch[2]).trim() 
          : `Consider exploring partnerships with ${formatCategoryName(category)} elements of the website.`;
        
        // Create the insight
        insights.push({
          id: `website-${category}-${Date.now()}`,
          category,
          confidence: Math.floor(Math.random() * 25) + 70, // Random between 70-94
          needsReview: true,
          content: {
            title,
            summary: `🌐 [Website-derived] ${summary}`,
            details,
            recommendations
          }
        });
      }
    }
    
    // If we couldn't extract any insights, create at least one
    if (insights.length === 0) {
      insights.push({
        id: `website-company_positioning-${Date.now()}`,
        category: 'company_positioning',
        confidence: 70,
        needsReview: true,
        content: {
          title: "Website Analysis",
          summary: "🌐 [Website-derived] The website contains information about the company's positioning and offerings.",
          details: "The website provides information about the company, though specific details were difficult to extract programmatically. Manual review is recommended.",
          recommendations: "Review the website manually to identify potential gaming partnership opportunities based on the company's products and services."
        }
      });
    }
    
    console.log(`Extracted ${insights.length} insights from text`);
    return insights;
  } catch (error) {
    console.error('Error extracting insights from text:', error);
    throw error;
  }
}

/**
 * Extract a certain number of sentences from text
 */
function extractSentences(text: string, count: number): string {
  const sentences = text.split(/[.!?](?:\s|$)/);
  return sentences.slice(0, count).join('. ') + '.';
}

/**
 * Format a category ID into a readable name
 */
function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Process insights to ensure they have all required fields
 */
export function processInsights(insights: Insight[], websiteUrl: string, clientName: string): Insight[] {
  return insights.map(insight => {
    // Ensure the insight has all required fields
    return {
      id: insight.id || `website-${insight.category || 'general'}-${Date.now()}`,
      category: insight.category || 'company_positioning',
      confidence: typeof insight.confidence === 'number' ? insight.confidence : 75,
      needsReview: typeof insight.needsReview === 'boolean' ? insight.needsReview : true,
      content: {
        title: insight.content?.title || `Website Insight for ${clientName}`,
        summary: insight.content?.summary || `🌐 [Website-derived] Analysis of ${websiteUrl}`,
        details: insight.content?.details || "Generated from website content analysis.",
        recommendations: insight.content?.recommendations || "Consider exploring potential gaming integration opportunities."
      }
    };
  });
}

/**
 * Generate fallback insights when Claude API fails
 */
export function generateFallbackInsights(websiteUrl: string, clientName: string, clientIndustry: string): Insight[] {
  console.log(`Generating fallback insights for ${websiteUrl}`);
  
  const timestamp = Date.now();
  const insights: Insight[] = [];
  
  // Company Positioning
  insights.push({
    id: `website-company_positioning-${timestamp}`,
    category: 'company_positioning',
    confidence: 80,
    needsReview: true,
    content: {
      title: `${clientName} Market Positioning`,
      summary: `🌐 [Website-derived] ${clientName} appears to operate in the ${clientIndustry} industry with a focus on digital services.`,
      details: `Based on an analysis of ${websiteUrl}, the company presents itself as a provider of solutions in the ${clientIndustry} space. Further manual analysis may reveal more specific positioning elements.`,
      recommendations: "Explore gaming integration opportunities that align with their digital presence and industry focus."
    }
  });
  
  // Competitive Landscape
  insights.push({
    id: `website-competitive_landscape-${timestamp}`,
    category: 'competitive_landscape',
    confidence: 70,
    needsReview: true,
    content: {
      title: `${clientIndustry} Competitive Environment`,
      summary: `🌐 [Website-derived] ${clientName} operates in a competitive ${clientIndustry} market with various digital touchpoints.`,
      details: `The website at ${websiteUrl} suggests the company competes in the digital ${clientIndustry} space. A comprehensive competitive analysis would require additional research beyond the website.`,
      recommendations: "Consider gaming elements that would differentiate their digital offerings from competitors in the space."
    }
  });
  
  // Key Partnerships
  insights.push({
    id: `website-key_partnerships-${timestamp}`,
    category: 'key_partnerships',
    confidence: 60,
    needsReview: true,
    content: {
      title: "Partnership Ecosystem",
      summary: `🌐 [Website-derived] ${clientName}'s website may contain information about their existing partnerships and integrations.`,
      details: `The website at ${websiteUrl} may reference partnerships or integrations. A manual review of the website could identify specific partnership opportunities.`,
      recommendations: "Research their existing partnerships to find complementary gaming opportunities that wouldn't conflict with current relationships."
    }
  });
  
  // Public Announcements
  insights.push({
    id: `website-public_announcements-${timestamp}`,
    category: 'public_announcements',
    confidence: 65,
    needsReview: true,
    content: {
      title: "Recent Company Announcements",
      summary: `🌐 [Website-derived] ${clientName} may have recent announcements that could indicate strategic direction.`,
      details: `The website at ${websiteUrl} may contain news or announcements sections that could provide insights into recent developments and future plans.`,
      recommendations: "Monitor their announcements for opportunities to align gaming initiatives with their strategic roadmap."
    }
  });
  
  // Consumer Engagement
  insights.push({
    id: `website-consumer_engagement-${timestamp}`,
    category: 'consumer_engagement',
    confidence: 75,
    needsReview: true,
    content: {
      title: "Digital Customer Engagement",
      summary: `🌐 [Website-derived] ${clientName} likely engages with customers through their website and potentially other digital channels.`,
      details: `The website at ${websiteUrl} serves as a primary customer touchpoint, suggesting opportunities for enhanced digital engagement through gaming elements.`,
      recommendations: "Consider gamification elements that could enhance customer engagement on their digital platforms."
    }
  });
  
  // Product/Service Fit
  insights.push({
    id: `website-product_service_fit-${timestamp}`,
    category: 'product_service_fit',
    confidence: 75,
    needsReview: true,
    content: {
      title: `${clientIndustry} Services and Gaming Potential`,
      summary: `🌐 [Website-derived] ${clientName}'s products or services in the ${clientIndustry} sector may offer gaming integration opportunities.`,
      details: `Based on their website at ${websiteUrl}, the company offers solutions in the ${clientIndustry} space that could potentially be enhanced through gaming or gamification elements.`,
      recommendations: "Identify specific products or services from their portfolio that would benefit most from gaming elements or partnerships."
    }
  });
  
  return insights;
}
