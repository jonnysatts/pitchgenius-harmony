
/**
 * Generator for individual mock insights
 */
import { Document, StrategicInsight, Project } from "@/lib/types";
import { getIndustrySpecificContent } from "./contentTemplates";

/**
 * Generate a single detailed mock insight
 */
export const generateDetailedInsight = (
  category: StrategicInsight['category'], 
  project: Project,
  documents: Document[]
): StrategicInsight => {
  const id = `insight_${Math.random().toString(36).substr(2, 9)}`;
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
  const needsReview = confidence < 85;
  
  // Determine industry-specific content
  const industrySpecificContent = getIndustrySpecificContent(project.clientIndustry, category);
  
  // Create a detailed content structure with required title and summary
  const content = {
    title: industrySpecificContent.title || "Strategic insight",
    summary: industrySpecificContent.summary || "Key strategic finding from document analysis",
    details: industrySpecificContent.details,
    evidence: industrySpecificContent.evidence,
    impact: industrySpecificContent.impact,
    recommendations: industrySpecificContent.recommendations,
    // Reference source documents when possible
    sources: documents.length > 0 
      ? documents.slice(0, Math.min(3, documents.length)).map(doc => ({
          id: doc.id,
          name: doc.name,
          relevance: "high"
        }))
      : undefined,
    dataPoints: industrySpecificContent.dataPoints
  };
  
  return {
    id,
    category,
    content,
    confidence,
    needsReview,
    // Set an explicit document source marker (different from website source)
    source: 'document'
  };
};

/**
 * Generate a set of fallback insights when the AI service is unavailable
 */
export const generateFallbackInsights = (
  industry: string = 'gaming', 
  documentCount: number = 3
): StrategicInsight[] => {
  // Create a mock array of documents for reference
  const mockDocuments: Document[] = Array(documentCount).fill(null).map((_, index) => ({
    id: `doc_${index}`,
    name: `Document ${index + 1}`,
    type: 'pdf',
    size: 1024 * 1024,
    url: '',
    projectId: '',
    createdAt: new Date()
  }));
  
  // Mock project for insight generation
  const mockProject: Project = {
    id: 'fallback_project',
    title: 'Fallback Project',
    clientName: 'Sample Client',
    clientIndustry: industry,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'system',
    description: 'This is a fallback project for sample insights'
  };
  
  // Generate one insight for each category
  return [
    generateDetailedInsight('business_challenges', mockProject, mockDocuments),
    generateDetailedInsight('audience_gaps', mockProject, mockDocuments),
    generateDetailedInsight('competitive_threats', mockProject, mockDocuments),
    generateDetailedInsight('gaming_opportunities', mockProject, mockDocuments),
    generateDetailedInsight('strategic_recommendations', mockProject, mockDocuments),
    generateDetailedInsight('key_narratives', mockProject, mockDocuments)
  ];
};
