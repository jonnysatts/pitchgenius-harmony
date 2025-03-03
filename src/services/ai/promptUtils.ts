
/**
 * Utilities for preparing document contents for AI processing
 */
import { Document, Project } from "@/lib/types";

/**
 * Prepare document contents for AI processing
 */
export const prepareDocumentContents = (documents: Document[], project: Project): any[] => {
  return documents.map(doc => {
    return {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      priority: doc.priority,
      summary: `Content from document: ${doc.name} (${doc.type})`,
      // In a real implementation, this would contain actual document text content
      // For now, we use placeholder text since we're using mock data anyway
      content: `This is simulated content for the document ${doc.name}. In a production environment, this would be the actual text extracted from the document.`
    };
  });
};

/**
 * Prepare website content for AI processing
 */
export const prepareWebsiteContent = (websiteUrl: string, project: Project): string => {
  // For the moment, provide more structured information to guide the AI analysis
  // This will be replaced with actual scraped content once Firecrawl is integrated
  return `
Website URL: ${websiteUrl}
Industry: ${project.clientIndustry}
Project Title: ${project.title}
Client Name: ${project.clientName}

ANALYSIS REQUIREMENTS:
- Extract specific details from the website about ${project.clientName}'s products, services, partnerships, and announcements
- Identify their target audience and how they position themselves in the market
- Look for any gaming-related content or opportunities already present
- Analyze their brand voice, messaging style, and visual identity
- Identify competitors mentioned or implied on their website
- Look for news articles, press releases, or blog posts with specific details

IMPORTANT: Do NOT generate generic or placeholder content. Only include specific, factual information that can be found on the website.
If you cannot find specific information for a category, explicitly note what's missing rather than creating generic content.
`;
};
