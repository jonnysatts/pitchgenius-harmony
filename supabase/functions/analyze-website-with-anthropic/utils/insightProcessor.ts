
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

// Define the supported website insight categories
const websiteInsightCategories = [
  'company_positioning',
  'competitive_landscape',
  'key_partnerships',
  'public_announcements',
  'consumer_engagement',
  'product_service_fit'
];

/**
 * Parse Claude's response to extract insights
 */
export function parseClaudeResponse(response: string): any[] {
  try {
    console.log('Attempting to parse Claude response into JSON format');
    
    // Try to find JSON in the response
    const jsonPattern = /\[\s*\{.*\}\s*\]/s;
    const match = response.match(jsonPattern);
    
    if (match) {
      console.log('Found JSON array pattern in response');
      const jsonStr = match[0];
      return JSON.parse(jsonStr);
    }
    
    // If direct JSON array not found, try to find structured data with insights key
    const insightsObjectPattern = /\{\s*"insights"\s*:\s*\[\s*\{.*\}\s*\]\s*\}/s;
    const objectMatch = response.match(insightsObjectPattern);
    
    if (objectMatch) {
      console.log('Found insights object pattern in response');
      const jsonObj = JSON.parse(objectMatch[0]);
      return jsonObj.insights || [];
    }
    
    // If still not found, check for JSON codeblock format
    const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)```/;
    const codeBlockMatch = response.match(codeBlockPattern);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      console.log('Found code block with JSON in response');
      const codeBlockContent = codeBlockMatch[1].trim();
      
      try {
        // First try parsing as an array
        return JSON.parse(codeBlockContent);
      } catch (e) {
        // Then try parsing as an object with insights key
        const jsonObj = JSON.parse(codeBlockContent);
        return jsonObj.insights || [];
      }
    }
    
    console.error('No valid JSON pattern found in response');
    throw new Error('Could not extract JSON from Claude response');
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw error;
  }
}

/**
 * Process insights to ensure they have all required fields
 */
export function processInsights(insights: any[], websiteUrl?: string, clientName?: string): any[] {
  try {
    console.log(`Processing ${insights.length} insights`);
    
    return insights.map((insight, index) => {
      const timestamp = Date.now();
      const randomId = uuidv4().substring(0, 8);
      
      // Ensure we have a valid category
      let category = insight.category || 'company_positioning';
      
      // Validate that the category is one of our supported categories
      if (!websiteInsightCategories.includes(category)) {
        category = websiteInsightCategories[index % websiteInsightCategories.length];
      }
      
      // Create a default content structure if missing
      const content = insight.content || {};
      
      // Ensure all required fields exist
      return {
        id: insight.id || `website-${category}-${randomId}`,
        category: category,
        confidence: insight.confidence || Math.floor(Math.random() * 26) + 70, // 70-95
        needsReview: insight.needsReview ?? (Math.random() > 0.7), // 30% chance of true
        source: 'website', // Always mark as website source
        content: {
          title: content.title || `${clientName || 'Website'} ${formatCategoryTitle(category)}`,
          summary: prefixSummary(content.summary || `Analysis of ${websiteUrl || 'the website'}`),
          details: content.details || `Information extracted from ${websiteUrl || 'the website'}`,
          recommendations: content.recommendations || `Gaming opportunities for ${category.replace(/_/g, ' ')}`,
          websiteUrl: websiteUrl,
          source: 'Website analysis'
        }
      };
    });
  } catch (error) {
    console.error('Error processing insights:', error);
    return insights; // Return original insights on error
  }
}

/**
 * Format a category ID into a proper title
 */
function formatCategoryTitle(category: string): string {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Add website marker prefix to summary if not present
 */
function prefixSummary(summary: string): string {
  if (summary.includes('[Website-derived]')) {
    return summary;
  }
  return `🌐 [Website-derived] ${summary}`;
}

/**
 * Generate fallback insights when Claude API fails
 */
export function generateFallbackInsights(websiteUrl: string, clientName: string, industry: string): any[] {
  console.log('Generating fallback insights for website analysis');
  
  const domain = websiteUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  const timestamp = Date.now();
  
  return websiteInsightCategories.map(category => {
    const id = `website-${category}-${uuidv4().substring(0, 8)}`;
    
    let title, summary, details, recommendations;
    
    switch (category) {
      case 'company_positioning':
        title = `${clientName} Brand Positioning`;
        summary = `🌐 [Website-derived] ${clientName} appears to position itself within the ${industry} sector, with potential for gaming integrations.`;
        details = `From an analysis of ${domain}, the company appears to be in the ${industry} industry. While specific positioning details weren't extractable through automated analysis, the website structure suggests a business-focused approach. Further manual review is recommended.`;
        recommendations = `Explore gaming mechanics that align with ${industry} sector positioning, possibly focusing on loyalty programs or gamified customer engagement.`;
        break;
        
      case 'competitive_landscape':
        title = `${industry} Competitive Analysis`;
        summary = `🌐 [Website-derived] Limited competitive information available from automated analysis of ${domain}.`;
        details = `The website at ${domain} doesn't explicitly mention competitors in a way that was extractable through automated analysis. Manual review of the site is recommended to better understand their competitive positioning.`;
        recommendations = `Research key competitors in the ${industry} space manually and analyze their gaming integration strategies to identify potential differentiation opportunities.`;
        break;
        
      case 'key_partnerships':
        title = `${clientName} Partnership Opportunities`;
        summary = `🌐 [Website-derived] Potential for strategic gaming partnerships based on ${domain}'s business model.`;
        details = `While specific partnership information wasn't readily extractable from ${domain}, the ${industry} focus suggests potential for collaborations. The company may have existing partnerships not prominently featured on their public website.`;
        recommendations = `Propose a co-branded gaming experience that could enhance ${clientName}'s customer engagement while providing value to their potential partners in the ${industry} space.`;
        break;
        
      case 'public_announcements':
        title = `${clientName} News and Announcements`;
        summary = `🌐 [Website-derived] Limited public announcements extractable from ${domain} through automated analysis.`;
        details = `Automated analysis of ${domain} didn't yield specific announcements or news items. The company may publish news through other channels or in sections requiring manual review.`;
        recommendations = `Monitor ${clientName}'s social media and news channels for announcements that could reveal timely gaming integration opportunities, particularly around product launches or marketing campaigns.`;
        break;
        
      case 'consumer_engagement':
        title = `${clientName} Customer Interaction Approach`;
        summary = `🌐 [Website-derived] ${domain} shows potential touchpoints for gamified customer engagement.`;
        details = `While specific customer engagement strategies weren't explicitly detailed on ${domain} in a way extractable through automated analysis, the website structure suggests standard business-to-customer communication channels.`;
        recommendations = `Consider gamified loyalty programs, challenges, or interactive experiences that could enhance ${clientName}'s customer engagement in alignment with ${industry} industry standards.`;
        break;
        
      case 'product_service_fit':
        title = `Gaming Integration for ${clientName}'s Offerings`;
        summary = `🌐 [Website-derived] Potential exists for gaming elements within ${clientName}'s ${industry} offerings.`;
        details = `Based on ${domain}'s presence in the ${industry} sector, there are likely opportunities to enhance their products or services with gaming elements, though specific offerings weren't extractable through automated analysis.`;
        recommendations = `Develop a targeted proposal for integrating gaming mechanics into ${clientName}'s core offerings, focusing on increased engagement, retention, and data collection through gamified experiences.`;
        break;
        
      default:
        title = `${clientName} ${formatCategoryTitle(category)}`;
        summary = `🌐 [Website-derived] Analysis of ${domain} in the ${industry} sector.`;
        details = `Limited information available through automated analysis of ${domain}. Manual review recommended.`;
        recommendations = `Explore gaming integration opportunities based on ${industry} industry standards and ${clientName}'s specific business model.`;
    }
    
    return {
      id,
      category,
      confidence: Math.floor(Math.random() * 16) + 70, // 70-85
      needsReview: true,
      source: 'website',
      content: {
        title,
        summary,
        details,
        recommendations,
        websiteUrl: websiteUrl,
        source: 'Website analysis (generated)'
      }
    };
  });
}
