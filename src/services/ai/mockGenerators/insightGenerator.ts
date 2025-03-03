
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
  
  // Create a detailed content structure
  const content: Record<string, any> = {
    title: industrySpecificContent.title,
    summary: industrySpecificContent.summary,
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
    dataPoints: industrySpecificContent.dataPoints,
  };
  
  return {
    id,
    category,
    content,
    confidence,
    needsReview
  };
};
