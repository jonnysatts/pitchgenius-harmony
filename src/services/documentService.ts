
import { Document } from "@/lib/types";

// Priority keywords to look for in filenames
const PRIORITY_KEYWORDS = [
  "executive", "summary", "strategy", "strategic", "competitive", 
  "market", "analysis", "research", "brief", "proposal",
  "roadmap", "vision", "customer", "product", "plan",
  "objectives", "innovation", "insight", "data", "core"
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
    const timestamp = new Date();
    const priority = calculateDocumentPriority(file.name);
    
    return {
      id: `doc_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      projectId: projectId,
      createdAt: timestamp,
      url: URL.createObjectURL(file), // Local temporary URL
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      priority
    };
  });
};

/**
 * Sort documents by priority (highest first)
 */
export const sortDocumentsByPriority = (documents: Document[]): Document[] => {
  return [...documents].sort((a, b) => {
    const aPriority = a.priority || 0;
    const bPriority = b.priority || 0;
    return bPriority - aPriority;
  });
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

/**
 * Estimate document complexity by file size and type
 * Returns a value from 1-5 where higher means more complex
 */
export const estimateDocumentComplexity = (document: Document): number => {
  const sizeInMB = document.size / (1024 * 1024);
  let complexity = 1;
  
  // Base complexity on file size
  if (sizeInMB > 10) {
    complexity += 2;
  } else if (sizeInMB > 5) {
    complexity += 1;
  }
  
  // Add complexity based on file type
  const fileCategory = getFileCategory(document.type);
  if (fileCategory === 'PDF' || fileCategory === 'Word') {
    complexity += 1;
  } else if (fileCategory === 'Excel' || fileCategory === 'PowerPoint') {
    complexity += 2;
  }
  
  return Math.min(complexity, 5);
};
