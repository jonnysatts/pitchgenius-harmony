
import { Document } from "@/lib/types";

/**
 * Returns mock documents for a given project only if no real documents exist
 */
export const getMockDocuments = (projectId: string): Document[] => {
  // Check if we already have real documents in localStorage
  const storageKey = `project_documents_${projectId}`;
  const existingDocs = localStorage.getItem(storageKey);
  
  // If we have stored documents, DO NOT return mock documents
  if (existingDocs) {
    try {
      const parsedDocs = JSON.parse(existingDocs);
      if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
        console.log(`Using ${parsedDocs.length} real documents for project ${projectId}`);
        return []; // Return empty array since real documents will be handled separately
      }
    } catch (e) {
      console.error("Error parsing stored documents:", e);
    }
  }
  
  // Only return mock documents if we don't have real ones
  console.log("Providing mock documents for new project");
  
  // Explicitly mark mock documents so they're easily identifiable
  return [
    {
      id: 'mock_doc_1',
      name: 'Brand Strategy.pdf (MOCK)',
      size: 1024 * 1024 * 2.3, // 2.3 MB
      type: 'application/pdf',
      url: 'https://example.com/docs/brand-strategy.pdf',
      projectId: projectId,
      createdAt: new Date('2023-01-15'),
      uploadedAt: '2023-01-15T09:30:00Z',
      uploadedBy: 'user_789',
      priority: 3
    },
    {
      id: 'mock_doc_2',
      name: 'Market Research.xlsx (MOCK)',
      size: 1024 * 1024 * 4.1, // 4.1 MB
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: 'https://example.com/docs/market-research.xlsx',
      projectId: projectId,
      createdAt: new Date('2023-01-12'),
      uploadedAt: '2023-01-12T11:45:00Z',
      uploadedBy: 'user_456',
      priority: 2
    },
    {
      id: 'mock_doc_3',
      name: 'Competitor Analysis.docx (MOCK)',
      size: 1024 * 1024 * 1.7, // 1.7 MB
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: 'https://example.com/docs/competitor-analysis.docx',
      projectId: projectId,
      createdAt: new Date('2023-01-10'),
      uploadedAt: '2023-01-10T15:20:00Z',
      uploadedBy: 'user_123',
      priority: 1
    }
  ];
};
