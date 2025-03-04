
import { Document } from "@/lib/types";

/**
 * Formats document information to present to AI
 */
export const formatDocumentInfo = (doc: Document): string => {
  return `Document: ${doc.name} (${doc.type}, ${formatFileSize(doc.size)})`;
};

/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Prepare document contents for AI prompt
 * Returns an array of document content objects instead of a string
 */
export const prepareDocumentContents = (documents: Document[]): any[] => {
  return documents
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .map((doc, index) => {
      return {
        name: doc.name,
        type: doc.type,
        size: formatFileSize(doc.size),
        priority: doc.priority || 0,
        content: doc.content || '',
        index: index + 1
      };
    });
};
