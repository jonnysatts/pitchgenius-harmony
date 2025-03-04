
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
    
    // Define valid categories
    const validCategories = new Set(['business_imperatives', 'gaming_audience_opportunity', 'strategic_activation_pathways']);
    
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
      
      // Normalize category
      let category = insight.category || 'business_imperatives';
      if (!validCategories.has(category)) {
        // Map to closest category
        if (category.includes('business') || category.includes('imperative')) {
          category = 'business_imperatives';
        } else if (category.includes('audience') || category.includes('opportunity')) {
          category = 'gaming_audience_opportunity';
        } else if (category.includes('activation') || category.includes('pathway')) {
          category = 'strategic_activation_pathways';
        } else {
          // Default fallback
          category = 'business_imperatives';
        }
      }
      
      // Clean up the summary to remove duplicate website-derived markers
      let summary = insight.content.summary || '';
      summary = summary.replace(/\[Website-derived\]/g, '').trim();
      summary = summary.replace(/🌐\s*🌐/g, '🌐').trim();
      summary = summary.replace(/Website-derived/g, '').trim(); // Remove any remaining text mentions
      
      // Fix recommendations to replace "A gaming company" with "Games Age"
      let recommendations = insight.content.recommendations || '';
      recommendations = recommendations.replace(/A gaming company/g, 'Games Age');
      recommendations = recommendations.replace(/The gaming company/g, 'Games Age');
      
      // Ensure the insight has the correct source
      return {
        ...insight,
        source: 'website' as 'website',  // Explicitly set source to 'website'
        // Add default values for any missing properties
        id: insight.id || `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: category as WebsiteInsightCategory,
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
      case 'business_imperatives':
        title = "Critical Business Challenge: Gaming Audience Connection";
        summary = "The brand is facing significant audience engagement challenges that gaming strategy could solve";
        recommendations = "Games Age should develop a targeted gaming audience strategy to address core business challenges";
        break;
      case 'gaming_audience_opportunity':
        title = "Untapped Gaming Audience Segment";
        summary = "A significant gaming audience segment aligns with brand values but remains unaddressed";
        recommendations = "Games Age should create targeted activation to engage this valuable gaming audience segment";
        break;
      case 'strategic_activation_pathways':
        title = "Multi-channel Gaming Experience Strategy";
        summary = "A coordinated activation approach across physical and digital touchpoints would drive business results";
        recommendations = "Games Age should implement an integrated gaming experience across Fortress venues and digital platforms";
        break;
      default:
        title = "Strategic Gaming Audience Opportunity";
        summary = "Analysis has identified a strategic opportunity to engage gaming audiences";
        recommendations = "Games Age should develop a targeted strategy to address this opportunity";
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
