
import { StrategicInsight, WebsiteInsightCategory } from '@/lib/types';
import { websiteInsightCategories } from '@/components/project/insights/constants';

/**
 * Hook to process and format website insights
 */
export const useWebsiteInsightsProcessor = () => {
  /**
   * Process and format website insights to ensure they have the correct structure and source
   */
  const processWebsiteInsights = (insights: StrategicInsight[]): StrategicInsight[] => {
    if (!insights || insights.length === 0) return [];
    
    // Ensure all insights are properly marked as website-derived
    return insights.map(insight => {
      // Skip any clearly malformed insights
      if (!insight.content || 
          !insight.content.title || 
          insight.content.title === ',' ||
          (insight.content.summary && insight.content.summary.includes('-1685557426'))) {
        console.warn('Found malformed insight, generating replacement', insight);
        
        // Create a properly formatted replacement
        return createReplacementInsight(insight.category as WebsiteInsightCategory);
      }
      
      // Check if the summary needs the website marker
      let summary = insight.content.summary || '';
      if (!summary.includes('[Website-derived]')) {
        summary = `🌐 [Website-derived] ${summary}`;
      }
      
      // Ensure the insight has the correct source
      return {
        ...insight,
        source: 'website' as 'website',  // Explicitly set source to 'website'
        // Add default values for any missing properties
        id: insight.id || `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: insight.category || 'company_positioning',
        confidence: insight.confidence || 80,
        needsReview: insight.needsReview !== undefined ? insight.needsReview : true,
        content: {
          ...(insight.content || {}),
          title: insight.content?.title || 'Website Insight',
          summary,
          details: insight.content?.details || 'No details provided',
          recommendations: insight.content?.recommendations || 'No recommendations provided'
        }
      };
    });
  };
  
  /**
   * Create a replacement insight for a malformed one
   */
  const createReplacementInsight = (category: WebsiteInsightCategory): StrategicInsight => {
    // Get category name
    const categoryObj = websiteInsightCategories.find(c => c.id === category);
    const categoryName = categoryObj?.label || 'Website Analysis';
    
    // Generate a more specific title
    let title: string;
    let summary: string;
    let recommendations: string;
    
    switch(category) {
      case 'company_positioning':
        title = "Brand Positioning Analysis";
        summary = "Analysis of how the company presents itself in the market";
        recommendations = "Align gaming initiatives with the company's existing brand positioning";
        break;
      case 'competitive_landscape':
        title = "Competitive Differentiators";
        summary = "Analysis of how the company positions against competitors";
        recommendations = "Develop gaming experiences that emphasize competitive advantages";
        break;
      case 'key_partnerships':
        title = "Strategic Partnership Opportunities";
        summary = "Analysis of current and potential strategic alliances";
        recommendations = "Explore gaming partnerships that complement existing business relationships";
        break;
      case 'public_announcements':
        title = "Recent Company Developments";
        summary = "Analysis of public announcements and company news";
        recommendations = "Time gaming initiatives to align with planned announcements for maximum impact";
        break;
      case 'consumer_engagement':
        title = "Customer Engagement Channels";
        summary = "Analysis of how the company engages with its audience";
        recommendations = "Implement gamification in existing customer touchpoints";
        break;
      case 'product_service_fit':
        title = "Gaming Integration Opportunities";
        summary = "Analysis of how gaming can enhance current offerings";
        recommendations = "Create gaming experiences that showcase product benefits";
        break;
      default:
        title = "Website Analysis";
        summary = "Strategic insights derived from website content";
        recommendations = "Consider gaming initiatives that align with overall business strategy";
    }
    
    return {
      id: `website-${category}-${Date.now()}`,
      source: 'website',
      category,
      confidence: 75,
      needsReview: true,
      content: {
        title,
        summary: `🌐 [Website-derived] ${summary}`,
        details: `This insight was generated from analyzing the website content, focusing on ${categoryName.toLowerCase()} aspects.`,
        recommendations
      }
    };
  };

  return { processWebsiteInsights };
};
