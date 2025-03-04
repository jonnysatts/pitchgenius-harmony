
import { StrategicInsight, WebsiteInsightCategory } from '@/lib/types';
import { websiteInsightCategories } from '@/components/project/insights/constants';
import { getCategoryTitle, getCategoryRecommendation, formatCategoryName } from '@/services/ai/websiteAnalysis/insightContentUtils';

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
      
      // Clean up the summary to remove duplicate website-derived markers
      let summary = insight.content.summary || '';
      summary = summary.replace(/\[Website-derived\]/g, '').trim();
      summary = summary.replace(/🌐\s*🌐/g, '🌐').trim();
      summary = summary.replace(/Website-derived/g, '').trim(); // Remove any remaining text mentions
      
      // Fix recommendations to replace "A gaming company" with "Games Age"
      let recommendations = insight.content.recommendations || '';
      recommendations = recommendations.replace(/A gaming company/g, 'Games Age');
      
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
          summary: `🌐 ${summary}`, // Use only the globe icon
          details: insight.content?.details || 'No details provided',
          recommendations
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
        recommendations = "Games Age should align gaming initiatives with the company's existing brand positioning";
        break;
      case 'competitive_landscape':
        title = "Competitive Differentiators";
        summary = "Analysis of how the company positions against competitors";
        recommendations = "Games Age should develop gaming experiences that emphasize competitive advantages";
        break;
      case 'key_partnerships':
        title = "Strategic Partnership Opportunities";
        summary = "Analysis of current and potential strategic alliances";
        recommendations = "Games Age should explore gaming partnerships that complement existing business relationships";
        break;
      case 'public_announcements':
        title = "Recent Company Developments";
        summary = "Analysis of public announcements and company news";
        recommendations = "Games Age should time gaming initiatives to align with planned announcements for maximum impact";
        break;
      case 'consumer_engagement':
        title = "Customer Engagement Channels";
        summary = "Analysis of how the company engages with its audience";
        recommendations = "Games Age should implement gamification in existing customer touchpoints";
        break;
      case 'product_service_fit':
        title = "Gaming Integration Opportunities";
        summary = "Analysis of how gaming can enhance current offerings";
        recommendations = "Games Age should create gaming experiences that showcase product benefits";
        break;
      default:
        title = "Website Analysis";
        summary = "Strategic insights derived from website content";
        recommendations = "Games Age should consider gaming initiatives that align with overall business strategy";
    }
    
    return {
      id: `website-${category}-${Date.now()}`,
      source: 'website',
      category,
      confidence: 75,
      needsReview: true,
      content: {
        title,
        summary: `🌐 ${summary}`, // Use only the globe icon
        details: `This insight was generated from analyzing the website content, focusing on ${categoryName.toLowerCase()} aspects.`,
        recommendations
      }
    };
  };

  return { processWebsiteInsights };
};
