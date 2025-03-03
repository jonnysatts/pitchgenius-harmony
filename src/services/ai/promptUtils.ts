
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
