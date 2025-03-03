
import { Document } from "@/lib/types";

// Priority keywords to look for in filenames
const PRIORITY_KEYWORDS = [
  "executive", "summary", "strategy", "strategic", "competitive", 
  "market", "analysis", "research", "brief", "proposal"
];

/**
 * Calculate document priority based on filename keywords
 * Higher priority (1-10) means the document is more important
 */
export const calculateDocumentPriority = (filename: string): number => {
  const lowerFilename = filename.toLowerCase();
  let priority = 0;
  
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (lowerFilename.includes(keyword)) {
      priority += 2;
    }
  });
  
  // Cap priority at 10
  return Math.min(Math.max(priority, 0), 10);
};

/**
 * Process uploaded files into Document objects
 */
export const processFiles = (files: File[], projectId: string, userId: string): Document[] => {
  return Array.from(files).map(file => {
    const timestamp = new Date().toISOString();
    const priority = calculateDocumentPriority(file.name);
    
    return {
      id: `doc_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: timestamp,
      uploadedBy: userId,
      url: URL.createObjectURL(file), // Local temporary URL
      priority
    };
  });
};

/**
 * Sort documents by priority (highest first)
 */
export const sortDocumentsByPriority = (documents: Document[]): Document[] => {
  return [...documents].sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

/**
 * Get file type category from MIME type
 */
export const getFileCategory = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('text')) return 'Text';
  return 'Other';
};
