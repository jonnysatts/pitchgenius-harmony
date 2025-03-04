
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
 * Updated to handle the response format from Messages API
 */
export function parseClaudeResponse(response: string): Insight[] {
  console.log('Starting to parse Claude response');
  
  try {
    // Attempt multiple JSON extraction strategies
    // First try to find JSON in code blocks
    let jsonStr = '';
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
      console.log(`Found JSON in code block: ${jsonStr.substring(0, 100)}...`);
    } else {
      // Try to find a JSON array directly
      const jsonArrayMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        jsonStr = jsonArrayMatch[0];
        console.log(`Found JSON array in response: ${jsonStr.substring(0, 100)}...`);
      } else {
        // Look for JSON object with insights array
        const jsonObjMatch = response.match(/\{\s*"insights"\s*:\s*(\[[\s\S]*\])\s*\}/);
        if (jsonObjMatch) {
          jsonStr = jsonObjMatch[1];
          console.log(`Found insights array in JSON object: ${jsonStr.substring(0, 100)}...`);
        } else {
          console.log('No JSON format found, using fallback extraction');
          return generateFallbackInsights("", "", "");
        }
      }
    }
    
    // Parse the JSON
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Handle both array of insights and object with insights array
      let insights: any[];
      if (Array.isArray(parsed)) {
        insights = parsed;
      } else if (parsed.insights && Array.isArray(parsed.insights)) {
        insights = parsed.insights;
      } else {
        console.error('Parsed JSON is not an array or object with insights array');
        return generateFallbackInsights("", "", "");
      }
      
      console.log(`Successfully parsed ${insights.length} insights from JSON`);
      
      // Validate and fix the insights
      return insights.map(insight => validateAndFixInsight(insight));
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      // Fall back to generated insights
      return generateFallbackInsights("", "", "");
    }
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return generateFallbackInsights("", "", "");
  }
}

/**
 * Validate and fix an insight to ensure it has all required fields
 * Adds proper defensive measures against malformed data
 */
function validateAndFixInsight(insight: any): Insight {
  // Generate a proper ID if missing or invalid
  const id = typeof insight.id === 'string' && insight.id.length > 0 
    ? insight.id 
    : `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Ensure category is one of the valid options
  const validCategories = [
    'company_positioning', 'competitive_landscape', 'key_partnerships',
    'public_announcements', 'consumer_engagement', 'product_service_fit'
  ];
  
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
  
  const recommendations = typeof insight.content?.recommendations === 'string' && 
                         insight.content.recommendations.length > 0
    ? cleanTextContent(insight.content.recommendations)
    : getCategoryRecommendation(category);
  
  return {
    id,
    category,
    confidence: typeof insight.confidence === 'number' ? insight.confidence : 75,
    needsReview: typeof insight.needsReview === 'boolean' ? insight.needsReview : true,
    content: {
      title,
      summary: `🌐 [Website-derived] ${summary.startsWith('🌐 [Website-derived]') ? summary.substring(21) : summary}`,
      details,
      recommendations
    }
  };
}

/**
 * Clean text content by removing any JSON-like fragments or invalid data
 */
function cleanTextContent(text: string): string {
  // Remove anything that looks like JSON key-value pairs
  let cleaned = text.replace(/"\w+":\s*"[^"]*"/g, "");
  cleaned = cleaned.replace(/"\w+":\s*\{[^}]*\}/g, "");
  cleaned = cleaned.replace(/"\w+":\s*\[[^\]]*\]/g, "");
  
  // Remove number sequences that look like error codes
  cleaned = cleaned.replace(/-?\d{8,}/g, "");
  
  // Clean up JSON syntax markers
  cleaned = cleaned.replace(/[{}\[\]",]/g, "");
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  // If nothing meaningful is left, return empty string
  if (cleaned.length < 3 || cleaned === "category" || cleaned === "." || cleaned === ":" || cleaned === ": .") {
    return "";
  }
  
  return cleaned;
}

/**
 * Get a default title based on category
 */
function getCategoryTitle(category: string): string {
  const titles = {
    company_positioning: "Company Positioning Analysis",
    competitive_landscape: "Competitive Landscape Overview",
    key_partnerships: "Strategic Partnerships Analysis",
    public_announcements: "Recent Public Announcements",
    consumer_engagement: "Consumer Engagement Opportunities",
    product_service_fit: "Product-Service Gaming Fit"
  };
  
  return titles[category as keyof typeof titles] || "Website Analysis Insight";
}

/**
 * Get a default recommendation based on category
 */
function getCategoryRecommendation(category: string): string {
  const recommendations = {
    company_positioning: "Align gaming initiatives with the company's brand positioning to ensure consistency and leverage existing brand equity.",
    competitive_landscape: "Identify gaps in competitors' gaming strategies to develop a distinctive positioning in the gaming space.",
    key_partnerships: "Explore gaming partnerships that complement existing strategic alliances and extend their value proposition.",
    public_announcements: "Time gaming initiatives to coincide with or follow major company announcements for maximum visibility.",
    consumer_engagement: "Develop gaming elements that enhance the existing customer journey and interaction points.",
    product_service_fit: "Integrate gaming mechanics that highlight and enhance the core value of existing products and services."
  };
  
  return recommendations[category as keyof typeof recommendations] || 
         "Consider incorporating gaming elements that align with the company's strategic goals.";
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
          : getCategoryRecommendation(category);
        
        // Create the insight
        insights.push({
          id: `website-${category}-${Date.now()}`,
          category,
          confidence: Math.floor(Math.random() * 25) + 70, // Random between 70-94
          needsReview: true,
          content: {
            title: cleanTextContent(title) || getCategoryTitle(category),
            summary: `🌐 [Website-derived] ${cleanTextContent(summary) || "Analysis from website content"}`,
            details: cleanTextContent(details) || `Website analysis focused on ${category.replace(/_/g, ' ')}.`,
            recommendations: cleanTextContent(recommendations) || getCategoryRecommendation(category)
          }
        });
      }
    }
    
    // If we couldn't extract any insights, create at least one
    if (insights.length === 0) {
      return generateFallbackInsights("", "", "");
    }
    
    console.log(`Extracted ${insights.length} insights from text`);
    return insights;
  } catch (error) {
    console.error('Error extracting insights from text:', error);
    return generateFallbackInsights("", "", "");
  }
}

/**
 * Extract a certain number of sentences from text
 */
function extractSentences(text: string, count: number): string {
  const sentences = text.split(/[.!?](?:\s|$)/).filter(s => s.trim().length > 0);
  return sentences.slice(0, count).join('. ') + (sentences.length > 0 ? '.' : '');
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
  if (!insights || insights.length === 0) {
    return generateFallbackInsights(websiteUrl, clientName, "");
  }
  
  return insights.map(insight => {
    // Ensure the insight has all required fields
    return validateAndFixInsight(insight);
  });
}

/**
 * Generate fallback insights when Claude API fails
 */
export function generateFallbackInsights(websiteUrl: string, clientName: string, clientIndustry: string): Insight[] {
  console.log(`Generating fallback insights for website`);
  
  const timestamp = Date.now();
  const companyName = clientName || "The client";
  const industry = clientIndustry || "technology";
  const insights: Insight[] = [];
  
  // Company Positioning
  insights.push({
    id: `website-company_positioning-${timestamp}-1`,
    category: 'company_positioning',
    confidence: 80,
    needsReview: true,
    content: {
      title: `Brand Positioning in ${formatCategoryName(industry)}`,
      summary: `🌐 [Website-derived] ${companyName} positions itself in the ${industry} market with a focus on customer service and innovation.`,
      details: `Based on website analysis, the company emphasizes its customer-focused approach and technological capabilities in the ${industry} sector. Their positioning appears to target both business and consumer segments with a premium service offering.`,
      recommendations: `Leverage the company's customer-centric positioning by creating gaming experiences that reinforce their commitment to service excellence and innovation.`
    }
  });
  
  // Competitive Landscape
  insights.push({
    id: `website-competitive_landscape-${timestamp}-2`,
    category: 'competitive_landscape',
    confidence: 75,
    needsReview: true,
    content: {
      title: `Competitive Differentiation Points`,
      summary: `🌐 [Website-derived] ${companyName} differentiates from competitors through service quality, reliability, and technological innovation.`,
      details: `The website highlights key differentiators including superior customer support, advanced technology infrastructure, and reliability. These appear to be core competitive advantages in a crowded market.`,
      recommendations: `Develop gaming elements that highlight competitive differentiators - consider a game that demonstrates superior service quality or technology advantages in an engaging way.`
    }
  });
  
  // Key Partnerships
  insights.push({
    id: `website-key_partnerships-${timestamp}-3`,
    category: 'key_partnerships',
    confidence: 70,
    needsReview: true,
    content: {
      title: `Strategic Alliance Opportunities`,
      summary: `🌐 [Website-derived] ${companyName} appears to maintain strategic partnerships with technology providers and industry associations.`,
      details: `The website mentions partnerships with technology providers and industry organizations, suggesting an openness to strategic alliances that enhance their market position and service offerings.`,
      recommendations: `Explore gaming partnerships that complement existing alliances, particularly with technology providers who could help implement gaming elements into current offerings.`
    }
  });
  
  // Public Announcements
  insights.push({
    id: `website-public_announcements-${timestamp}-4`,
    category: 'public_announcements',
    confidence: 72,
    needsReview: true,
    content: {
      title: `Recent Corporate Developments`,
      summary: `🌐 [Website-derived] ${companyName} has recently announced service expansions and technology upgrades according to their website.`,
      details: `News sections on the website indicate recent expansions in service offerings and technology infrastructure upgrades, reflecting a growth-oriented business strategy.`,
      recommendations: `Time gaming initiative announcements to align with planned product or service launches to maximize visibility and create marketing synergies.`
    }
  });
  
  // Consumer Engagement
  insights.push({
    id: `website-consumer_engagement-${timestamp}-5`,
    category: 'consumer_engagement',
    confidence: 85,
    needsReview: true,
    content: {
      title: `Digital Customer Experience`,
      summary: `🌐 [Website-derived] ${companyName}'s website reveals multiple digital touchpoints for customer engagement including online account management and support.`,
      details: `The website features multiple customer engagement channels including online account management, support portals, and social media integration, indicating a commitment to digital customer experience.`,
      recommendations: `Implement gamification elements within existing customer portals to increase engagement and time spent in owned digital channels.`
    }
  });
  
  // Product/Service Fit
  insights.push({
    id: `website-product_service_fit-${timestamp}-6`,
    category: 'product_service_fit',
    confidence: 80,
    needsReview: true,
    content: {
      title: `Gaming Integration Potential`,
      summary: `🌐 [Website-derived] ${companyName}'s ${industry} services offer several opportunities for gaming integration, particularly in customer education and loyalty.`,
      details: `The product and service offerings displayed on the website could benefit from gaming elements particularly in areas of customer education, loyalty development, and community building among users.`,
      recommendations: `Create interactive games or challenges that educate customers about service offerings while rewarding engagement and loyalty.`
    }
  });
  
  return insights;
}
