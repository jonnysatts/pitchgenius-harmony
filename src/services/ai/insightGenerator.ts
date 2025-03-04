
import { Document, StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { prepareDocumentContents } from './promptUtils';

/**
 * Analyzes documents to generate strategic insights
 */
export const analyzeDocuments = async (
  documents: Document[],
  projectId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Analyzing ${documents.length} documents for project ${projectId}`);
    
    // Prepare documents for analysis - this extracts text content
    const documentsContent = prepareDocumentContents(documents);
    
    if (documentsContent.length === 0) {
      return {
        success: false,
        message: 'No document content could be extracted. Please check the document formats.'
      };
    }
    
    // In a real implementation, here we would call the API with documentsContent
    // We'll mark it as successful for now since the actual API call happens elsewhere
    return {
      success: true,
      message: `Successfully prepared ${documents.length} documents for analysis.`
    };
  } catch (error) {
    console.error('Error analyzing documents:', error);
    return {
      success: false,
      message: `Failed to analyze documents: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

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
