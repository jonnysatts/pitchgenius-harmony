
/**
 * Industry-specific content templates for mock insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { retailTemplates } from "./industryTemplates/retail";
import { financeTemplates } from "./industryTemplates/finance";
import { technologyTemplates } from "./industryTemplates/technology";
import { entertainmentTemplates } from "./industryTemplates/entertainment";
import { otherTemplates } from "./industryTemplates/other";

/**
 * Get industry-specific content based on industry and insight category
 */
export const getIndustrySpecificContent = (
  industry: Project['clientIndustry'],
  category: StrategicInsight['category']
): Record<string, any> => {
  // Define the templates mapping to industry-specific templates
  const templates: Record<string, Record<string, Record<string, any>>> = {
    retail: retailTemplates,
    finance: financeTemplates,
    technology: technologyTemplates,
    entertainment: entertainmentTemplates,
    other: otherTemplates
  };
  
  // Fallback content if specific template isn't available
  const fallbackContent = {
    title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} for ${industry} industry`,
    summary: `Key ${category.replace('_', ' ')} identified through document analysis.`,
    details: `Comprehensive analysis of client documents reveals significant patterns related to ${category.replace('_', ' ')} that require strategic attention. Multiple data points across various sources confirm this finding.`,
    evidence: "Document analysis revealed consistent patterns across multiple data sources and market research reports.",
    impact: "This insight has significant implications for business growth, market positioning, and competitive advantage.",
    recommendations: "Implement gaming strategies that directly address this insight through engagement mechanics, retention hooks, and monetization opportunities.",
    dataPoints: [
      "Multiple supporting data points identified across documents",
      "Consistent pattern recognition with 87% confidence interval",
      "Strategic relevance rated as high"
    ]
  };
  
  // Return template if available, otherwise fallback
  return templates[industry]?.[category] || fallbackContent;
};
