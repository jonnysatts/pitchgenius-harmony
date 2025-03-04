
import { StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Extracts key insights from document analysis
 */
export const extractInsightsFromAnalysis = (analysisResults: any[]): StrategicInsight[] => {
  // Transformation logic here - this would convert raw API data into our insight format
  return analysisResults.map(result => {
    const insightId = uuidv4();
    
    // Basic structure conversion
    return {
      id: insightId,
      category: result.category || 'business_challenges',
      content: {
        title: result.title || 'Strategic Insight',
        summary: result.summary || 'Key strategic finding',
        details: result.details || undefined,
        evidence: result.evidence || undefined,
        recommendations: result.recommendations || undefined,
        dataPoints: result.dataPoints || undefined,
        sources: result.sources || undefined,
        impact: result.impact || undefined
      },
      confidence: result.confidence || 75,
      needsReview: result.needsReview !== undefined ? result.needsReview : true,
      source: 'document'
    };
  });
};
