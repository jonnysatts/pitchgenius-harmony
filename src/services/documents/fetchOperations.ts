
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
        
        if (Array.isArray(storedDocs) && storedDocs.length > 0) {
          console.log(`Found ${storedDocs.length} stored documents for project ${projectId}`);
          return storedDocs.map(convertApiDocumentToModel);
        }
      } catch (parseError) {
        console.error('Error parsing stored documents:', parseError);
      }
    }
    
    // Only get mock documents if no stored documents exist
    console.log('No stored documents found, checking for mock documents');
    const mockDocuments = getMockDocuments(projectId);
    
    if (mockDocuments.length > 0) {
      console.log(`Using ${mockDocuments.length} mock documents for project ${projectId}`);
    } else {
      console.log('No documents found for project:', projectId);
    }
    
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
    
    // Save the new document to localStorage to persist it
    saveDocumentToLocalStorage(projectId, newDocument);
    
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
    id: `local_${Math.random().toString(36).substr(2, 9)}`,
    projectId: projectId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file), // Create a blob URL for the file
    createdAt: now,
    uploadedAt: now.toISOString(),
    uploadedBy: 'user_123',
    priority: priority
  };
  
  console.log('Simulated document upload:', newDocument);
  return newDocument;
};

// Helper function to save documents to localStorage
const saveDocumentToLocalStorage = (projectId: string, document: Document) => {
  const storageKey = `project_documents_${projectId}`;
  let documents: Document[] = [];
  
  // Get existing documents
  const existingDocs = localStorage.getItem(storageKey);
  if (existingDocs) {
    try {
      const parsed = JSON.parse(existingDocs);
      if (Array.isArray(parsed)) {
        documents = parsed;
      }
    } catch (e) {
      console.error('Error parsing existing documents:', e);
    }
  }
  
  // Add the new document
  documents.push(document);
  
  // Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(documents));
  console.log(`Document saved to localStorage. Total documents: ${documents.length}`);
};
