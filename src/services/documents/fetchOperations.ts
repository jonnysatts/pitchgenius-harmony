import { Document } from "@/lib/types";
import { getMockDocuments } from "./mockDocuments";

const convertApiDocumentToModel = (doc: any): Document => {
  return {
    id: doc.id,
    name: doc.name,
    size: doc.size,
    type: doc.type,
    url: doc.url,
    projectId: doc.project_id || '',
    createdAt: new Date(doc.created_at || doc.uploadedAt || Date.now()),
    uploadedBy: doc.user_id || doc.uploadedBy || 'anonymous',
    priority: doc.priority || 0,
    uploadedAt: doc.uploaded_at || doc.uploadedAt || new Date().toISOString()
  };
};

export const fetchProjectDocumentsFromApi = async (projectId: string): Promise<Document[]> => {
  try {
    console.log('Fetching documents for project:', projectId);
    // In a real implementation, this would call an API endpoint
    
    // Simulate API response
    const mockDocuments = getMockDocuments(projectId);
    
    // Convert to Document model
    return mockDocuments.map(convertApiDocumentToModel);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const uploadDocumentToApi = async (
  projectId: string,
  file: File,
  priority: number = 0
): Promise<Document | null> => {
  try {
    console.log('Uploading document to project:', projectId, file.name);
    
    // Simulate API call
    const newDocument = simulateDocumentUpload(projectId, file, priority);
    
    return newDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
};

const simulateDocumentUpload = (
  projectId: string,
  file: File,
  priority: number
): Document => {
  const now = new Date();
  
  const newDocument: Document = {
    id: `doc_${Date.now()}`,
    projectId: projectId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: 'https://example.com/document/' + file.name,
    createdAt: now,
    uploadedAt: now.toISOString(),
    uploadedBy: 'user_123',
    priority: priority
  };
  
  console.log('Simulated document upload:', newDocument);
  return newDocument;
};
