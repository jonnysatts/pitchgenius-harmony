/**
 * Module for handling AI prompt utilities
 */
import { Document, Project } from "@/lib/types";

/**
 * Generate a website research prompt
 */
export const generateWebsiteResearchPrompt = (websiteUrl: string, clientName: string, clientIndustry: string): string => {
  return `
    Please analyze the content from ${clientName}'s website (${websiteUrl}) in the ${clientIndustry} industry.
    Identify key strategic opportunities, business challenges, and potential areas for gaming partnerships.
  `;
};

/**
 * Prepare document contents for AI processing
 */
export const prepareDocumentContents = (documents: Document[], project: Project): any[] => {
  return documents.map(doc => {
    // Sort by priority if available
    const priority = doc.priority || 0;
    
    return {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      content: `Content from document: ${doc.name}`, // Simplified for mock purposes
      priority: priority
    };
  }).sort((a, b) => (b.priority || 0) - (a.priority || 0));
};
