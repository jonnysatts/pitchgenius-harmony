
import { StrategicInsight } from '@/lib/types';

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
          summary: insight.content?.summary || 'Analysis from website',
          details: insight.content?.details || 'No details provided',
          recommendations: insight.content?.recommendations || 'No recommendations provided'
        }
      };
    });
  };

  return { processWebsiteInsights };
};
