
import { Document } from "@/lib/types";
import { getMockDocuments } from "./mockDocuments";

const convertApiDocumentToModel = (doc: any): Document => {
  return {
    id: doc.id,
    name: doc.name,
    size: doc.size,
    type: doc.type,
    url: doc.url,
    projectId: doc.project_id || doc.projectId || '',
    createdAt: new Date(doc.created_at || doc.uploadedAt || doc.createdAt || Date.now()),
    uploadedBy: doc.user_id || doc.uploadedBy || 'anonymous',
    priority: doc.priority || 0,
    uploadedAt: doc.uploaded_at || doc.uploadedAt || new Date().toISOString()
  };
};

export const fetchProjectDocumentsFromApi = async (projectId: string): Promise<Document[]> => {
  try {
    console.log('Fetching documents for project:', projectId);
    
    // First check if we have real documents in localStorage
    const storageKey = `project_documents_${projectId}`;
    const storedDocsJson = localStorage.getItem(storageKey);
    
    if (storedDocsJson) {
      try {
        const storedDocs = JSON.parse(storedDocsJson);
        console.log('Found stored documents:', storedDocs.length);
        
        if (Array.isArray(storedDocs) && storedDocs.length > 0) {
          // Return stored documents if they exist
          return storedDocs.map(convertApiDocumentToModel);
        }
      } catch (parseError) {
        console.error('Error parsing stored documents:', parseError);
      }
    }
    
    // Only use mock documents if no stored documents exist
    console.log('No stored documents found, using mock documents');
    const mockDocuments = getMockDocuments(projectId);
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
