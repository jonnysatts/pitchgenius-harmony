
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
export const prepareWebsiteContent = (url: string, project: Project): any => {
  return {
    url: url,
    industry: project.clientIndustry,
    // In a real implementation, this would contain scraped text content from the website
    content: `This is simulated content scraped from the website ${url}. In a production environment, this would be the actual content scraped from the client's website, including text from key pages like Home, About, Products/Services, and Contact pages.`
  };
};
