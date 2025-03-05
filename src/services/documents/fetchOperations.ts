
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
  if (!projectId) {
    console.error('No project ID provided to fetch documents');
    return [];
  }

  try {
    console.log('Fetching documents for specific project ID:', projectId);
    
    // Use a more specific storage key to prevent cross-project contamination
    const storageKey = `project_documents_${projectId}`;
    console.log('Looking for documents with storage key:', storageKey);
    
    const storedDocsJson = localStorage.getItem(storageKey);
    
    if (storedDocsJson) {
      try {
        const storedDocs = JSON.parse(storedDocsJson);
        
        if (Array.isArray(storedDocs) && storedDocs.length > 0) {
          console.log(`Found ${storedDocs.length} stored documents for project ${projectId}`);
          
          // Ensure all documents have the correct project ID
          const validatedDocs = storedDocs.map(doc => ({
            ...doc,
            projectId: projectId
          }));
          
          // Save back the validated docs to ensure integrity
          localStorage.setItem(storageKey, JSON.stringify(validatedDocs));
          
          return validatedDocs.map(convertApiDocumentToModel);
        } else {
          console.log(`No documents found in storage for project ${projectId} (empty array)`);
        }
      } catch (parseError) {
        console.error(`Error parsing stored documents for project ${projectId}:`, parseError);
      }
    } else {
      console.log(`No documents found in storage for project ${projectId} (no entry)`);
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
    console.error(`Error fetching documents for project ${projectId}:`, error);
    return [];
  }
};

export const uploadDocumentToApi = async (
  projectId: string,
  file: File,
  priority: number = 0
): Promise<Document | null> => {
  if (!projectId) {
    console.error('No project ID provided for document upload');
    return null;
  }

  try {
    console.log('Uploading document to specific project:', projectId, file.name);
    
    // Generate a unique ID for the document
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(file);
    
    // Create document object
    const now = new Date();
    const newDocument: Document = {
      id: docId,
      projectId: projectId, // Ensure correct project ID is set
      name: file.name,
      size: file.size,
      type: file.type,
      url: blobUrl,
      createdAt: now,
      uploadedAt: now.toISOString(),
      uploadedBy: 'current_user',
      priority: priority
    };
    
    // Save to localStorage with consistent key format and project ID
    const storageKey = `project_documents_${projectId}`;
    console.log(`Saving document to storage key: ${storageKey}`);
    
    // Get existing documents for this specific project
    let documents: Document[] = [];
    const existingDocs = localStorage.getItem(storageKey);
    
    if (existingDocs) {
      try {
        const parsed = JSON.parse(existingDocs);
        if (Array.isArray(parsed)) {
          documents = parsed;
          console.log(`Found ${documents.length} existing documents for project ${projectId}`);
        }
      } catch (e) {
        console.error(`Error parsing existing documents for project ${projectId}:`, e);
      }
    } else {
      console.log(`No existing documents found for project ${projectId}, creating new array`);
    }
    
    // Add the new document and save back to localStorage
    documents.push(newDocument);
    localStorage.setItem(storageKey, JSON.stringify(documents));
    
    console.log(`Document saved to localStorage. Total documents for project ${projectId}: ${documents.length}`);
    
    return newDocument;
  } catch (error) {
    console.error(`Error uploading document to project ${projectId}:`, error);
    return null;
  }
};

export const removeDocumentFromApi = async (documentId: string): Promise<boolean> => {
  if (!documentId) {
    console.error('No document ID provided for document removal');
    return false;
  }

  try {
    console.log('Removing document:', documentId);
    
    // Search in all project document storage keys
    const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('project_documents_'));
    
    let documentRemoved = false;
    let projectIdFound = null;
    
    for (const storageKey of storageKeys) {
      const storedDocsJson = localStorage.getItem(storageKey);
      if (storedDocsJson) {
        try {
          const storedDocs = JSON.parse(storedDocsJson);
          
          if (Array.isArray(storedDocs)) {
            const documentToRemove = storedDocs.find(doc => doc.id === documentId);
            
            if (documentToRemove) {
              projectIdFound = documentToRemove.projectId || storageKey.replace('project_documents_', '');
              console.log(`Found document ${documentId} in project ${projectIdFound}`);
            }
            
            // Filter out the document to be removed
            const filteredDocs = storedDocs.filter(doc => doc.id !== documentId);
            
            // If the length changed, we found and removed the document
            if (filteredDocs.length !== storedDocs.length) {
              localStorage.setItem(storageKey, JSON.stringify(filteredDocs));
              documentRemoved = true;
              console.log(`Document ${documentId} removed from ${storageKey}`);
              
              // Revoke the blob URL if it exists
              const removedDoc = storedDocs.find(doc => doc.id === documentId);
              if (removedDoc && removedDoc.url && removedDoc.url.startsWith('blob:')) {
                try {
                  URL.revokeObjectURL(removedDoc.url);
                  console.log(`Revoked blob URL for document ${documentId}`);
                } catch (e) {
                  console.warn('Could not revoke blob URL:', e);
                }
              }
            }
          }
        } catch (parseError) {
          console.error(`Error parsing documents from ${storageKey}:`, parseError);
        }
      }
    }
    
    if (!documentRemoved) {
      console.warn(`Document ${documentId} not found in any localStorage storage`);
    } else if (projectIdFound) {
      console.log(`Successfully removed document ${documentId} from project ${projectIdFound}`);
    }
    
    return documentRemoved;
  } catch (error) {
    console.error('Error removing document:', error);
    return false;
  }
};
