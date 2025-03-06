import { Document } from "@/lib/types";
import { storage } from "../api/storageAdapter";
import { STORAGE_KEYS } from "../api/config";
import { errorService, ErrorType } from "../error/errorService";

// Constants
const MOCK_DOCUMENT_PREFIX = "mock_";
const DOCUMENT_ID_PREFIX = "doc_";
const MAX_DOCUMENTS_PER_PROJECT = 100;

/**
 * Document lifecycle status
 */
export enum DocumentStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  PROCESSED = "processed",
  ANALYZED = "analyzed",
  DELETED = "deleted",
  ERROR = "error"
}

/**
 * Extended document interface with lifecycle tracking
 */
export interface DocumentWithLifecycle extends Document {
  status: DocumentStatus;
  statusHistory: { status: DocumentStatus; timestamp: string }[];
  processingError?: string;
}

/**
 * Validates a project ID
 */
function validateProjectId(projectId: string | undefined | null): string {
  if (!projectId) {
    const error = new Error("Invalid or missing project ID");
    errorService.handleError(error, { 
      context: "document-service",
      type: ErrorType.VALIDATION_ERROR
    });
    throw error;
  }
  return projectId;
}

/**
 * Validates a document ID
 */
function validateDocumentId(documentId: string | undefined | null): string {
  if (!documentId) {
    const error = new Error("Invalid or missing document ID");
    errorService.handleError(error, { 
      context: "document-service",
      type: ErrorType.VALIDATION_ERROR
    });
    throw error;
  }
  return documentId;
}

/**
 * Generates a unique document ID
 */
function generateDocumentId(): string {
  return `${DOCUMENT_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determines if a document is a mock document
 */
export function isMockDocument(document: Document): boolean {
  return document.id.startsWith(MOCK_DOCUMENT_PREFIX);
}

/**
 * Updates document status with history tracking
 */
function updateDocumentStatus(
  document: DocumentWithLifecycle, 
  newStatus: DocumentStatus, 
  error?: string
): DocumentWithLifecycle {
  const timestamp = new Date().toISOString();
  
  const updatedDoc = {
    ...document,
    status: newStatus,
    statusHistory: [
      ...(document.statusHistory || []),
      { status: newStatus, timestamp }
    ]
  };
  
  if (error && newStatus === DocumentStatus.ERROR) {
    updatedDoc.processingError = error;
  }
  
  return updatedDoc;
}

/**
 * Converts any document to DocumentWithLifecycle format
 */
function ensureLifecycleFormat(document: Document): DocumentWithLifecycle {
  if ('status' in document && 'statusHistory' in document) {
    return document as DocumentWithLifecycle;
  }
  
  // Initialize lifecycle properties if missing
  return {
    ...document,
    status: DocumentStatus.UPLOADED,
    statusHistory: [
      { status: DocumentStatus.UPLOADED, timestamp: new Date().toISOString() }
    ]
  };
}

/**
 * Document service for handling document operations
 */
export const documentService = {
  /**
   * Fetch all documents for a project
   */
  async fetchProjectDocuments(projectId: string): Promise<DocumentWithLifecycle[]> {
    try {
      validateProjectId(projectId);
      
      // Get storage key for project documents
      const storageKey = STORAGE_KEYS.projectDocuments(projectId);
      
      // Fetch documents from storage
      const documents = await storage.getItem<Document[]>(storageKey) || [];
      
      // Ensure all documents have the correct project ID and lifecycle format
      return documents.map(doc => ensureLifecycleFormat({
        ...doc,
        projectId: projectId // Ensure project ID is set correctly
      }));
    } catch (error) {
      errorService.handleError(error, { 
        context: "fetch-project-documents",
        projectId
      });
      return [];
    }
  },
  
  /**
   * Upload a document to a project
   */
  async uploadDocument(
    projectId: string, 
    file: File, 
    priority: number = 0
  ): Promise<DocumentWithLifecycle | null> {
    try {
      validateProjectId(projectId);
      
      // Get storage key for project documents
      const storageKey = STORAGE_KEYS.projectDocuments(projectId);
      
      // Generate document ID
      const docId = generateDocumentId();
      
      // Create a blob URL for the file
      const blobUrl = URL.createObjectURL(file);
      
      // Get existing documents
      const existingDocs = await storage.getItem<DocumentWithLifecycle[]>(storageKey) || [];
      
      // Check if we're at the document limit
      if (existingDocs.length >= MAX_DOCUMENTS_PER_PROJECT) {
        throw new Error(`Project has reached the maximum of ${MAX_DOCUMENTS_PER_PROJECT} documents`);
      }
      
      // Create document with lifecycle
      const now = new Date();
      const newDocument: DocumentWithLifecycle = {
        id: docId,
        projectId: projectId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: blobUrl,
        createdAt: now,
        uploadedAt: now.toISOString(),
        uploadedBy: 'current_user',
        priority: priority,
        status: DocumentStatus.UPLOADED,
        statusHistory: [
          { status: DocumentStatus.UPLOADED, timestamp: now.toISOString() }
        ]
      };
      
      // Check for duplicate file names
      const duplicateNameCount = existingDocs.filter(doc => doc.name === file.name).length;
      if (duplicateNameCount > 0) {
        // Add a suffix to make the name unique
        newDocument.name = `${file.name} (${duplicateNameCount + 1})`;
      }
      
      // Add to existing documents
      const updatedDocs = [...existingDocs, newDocument];
      
      // Save to storage
      await storage.setItem(storageKey, updatedDocs);
      
      return newDocument;
    } catch (error) {
      errorService.handleError(error, { 
        context: "upload-document",
        projectId,
        fileName: file.name
      });
      return null;
    }
  },
  
  /**
   * Remove a document from a project
   */
  async removeDocument(documentId: string): Promise<boolean> {
    try {
      validateDocumentId(documentId);
      
      // Track if document was removed
      let documentRemoved = false;
      let projectId = null;
      
      // Get all document storage keys
      const keys = await storage.getAllKeys('project_documents_');
      
      for (const key of keys) {
        // Get documents for this key
        const documents = await storage.getItem<DocumentWithLifecycle[]>(key) || [];
        
        // Find the document to remove
        const docToRemove = documents.find(doc => doc.id === documentId);
        
        if (docToRemove) {
          projectId = docToRemove.projectId;
          
          // Update the document's status to deleted
          const updatedDoc = updateDocumentStatus(docToRemove, DocumentStatus.DELETED);
          
          // For non-mock documents, revoke the blob URL
          if (!isMockDocument(docToRemove) && docToRemove.url?.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(docToRemove.url);
            } catch (e) {
              console.warn('Could not revoke blob URL:', e);
            }
          }
          
          // Filter out the document
          const filteredDocs = documents.filter(doc => doc.id !== documentId);
          
          // Save updated documents
          await storage.setItem(key, filteredDocs);
          documentRemoved = true;
          
          // No need to check other keys since we found the document
          break;
        }
      }
      
      if (!documentRemoved) {
        console.warn(`Document ${documentId} not found in any storage`);
      }
      
      return documentRemoved;
    } catch (error) {
      errorService.handleError(error, { 
        context: "remove-document",
        documentId
      });
      return false;
    }
  },
  
  /**
   * Update document status
   */
  async updateDocumentStatus(
    documentId: string, 
    status: DocumentStatus, 
    error?: string
  ): Promise<boolean> {
    try {
      validateDocumentId(documentId);
      
      // Get all document storage keys
      const keys = await storage.getAllKeys('project_documents_');
      
      for (const key of keys) {
        // Get documents for this key
        const documents = await storage.getItem<DocumentWithLifecycle[]>(key) || [];
        
        // Find the document to update
        const docIndex = documents.findIndex(doc => doc.id === documentId);
        
        if (docIndex >= 0) {
          // Update document status
          const updatedDoc = updateDocumentStatus(
            documents[docIndex], 
            status,
            error
          );
          
          // Update the document in the array
          documents[docIndex] = updatedDoc;
          
          // Save updated documents
          await storage.setItem(key, documents);
          return true;
        }
      }
      
      console.warn(`Document ${documentId} not found for status update`);
      return false;
    } catch (error) {
      errorService.handleError(error, { 
        context: "update-document-status",
        documentId,
        status
      });
      return false;
    }
  },
  
  /**
   * Clean up old documents from a project
   */
  async cleanupProjectDocuments(projectId: string, maxAge?: number): Promise<number> {
    try {
      validateProjectId(projectId);
      
      // Get storage key for project documents
      const storageKey = STORAGE_KEYS.projectDocuments(projectId);
      
      // Get all documents for this project
      const documents = await storage.getItem<DocumentWithLifecycle[]>(storageKey) || [];
      
      // If maxAge is provided, filter out documents older than maxAge
      let docsToRemove: DocumentWithLifecycle[] = [];
      let remainingDocs = documents;
      
      if (maxAge) {
        const cutoffDate = new Date(Date.now() - maxAge);
        
        // Separate documents to remove and keep
        docsToRemove = documents.filter(doc => {
          const createdAt = doc.createdAt instanceof Date 
            ? doc.createdAt 
            : new Date(doc.createdAt);
          return createdAt < cutoffDate;
        });
        
        remainingDocs = documents.filter(doc => {
          const createdAt = doc.createdAt instanceof Date 
            ? doc.createdAt 
            : new Date(doc.createdAt);
          return createdAt >= cutoffDate;
        });
      }
      
      // Revoke blob URLs for documents to remove
      for (const doc of docsToRemove) {
        if (!isMockDocument(doc) && doc.url?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(doc.url);
          } catch (e) {
            console.warn('Could not revoke blob URL:', e);
          }
        }
      }
      
      // Save remaining documents
      await storage.setItem(storageKey, remainingDocs);
      
      return docsToRemove.length;
    } catch (error) {
      errorService.handleError(error, { 
        context: "cleanup-project-documents",
        projectId
      });
      return 0;
    }
  },
  
  /**
   * Associate documents with insights
   */
  async associateDocumentsWithInsight(
    projectId: string, 
    insightId: string, 
    documentIds: string[]
  ): Promise<boolean> {
    try {
      validateProjectId(projectId);
      
      // Get storage keys
      const docsStorageKey = STORAGE_KEYS.projectDocuments(projectId);
      const insightsStorageKey = STORAGE_KEYS.projectInsights(projectId);
      
      // Get documents and insights
      const documents = await storage.getItem<DocumentWithLifecycle[]>(docsStorageKey) || [];
      const insightsData = await storage.getItem<{ insights: any[] }>(insightsStorageKey) || { insights: [] };
      
      // Find the insight to update
      const insightIndex = insightsData.insights.findIndex(insight => insight.id === insightId);
      
      if (insightIndex < 0) {
        console.warn(`Insight ${insightId} not found for association`);
        return false;
      }
      
      // Update insight with document references
      insightsData.insights[insightIndex].sourceDocuments = documentIds;
      
      // Update document status for each associated document
      for (const docId of documentIds) {
        const docIndex = documents.findIndex(doc => doc.id === docId);
        
        if (docIndex >= 0) {
          documents[docIndex] = updateDocumentStatus(
            documents[docIndex],
            DocumentStatus.ANALYZED
          );
        }
      }
      
      // Save updated data
      await storage.setItem(docsStorageKey, documents);
      await storage.setItem(insightsStorageKey, insightsData);
      
      return true;
    } catch (error) {
      errorService.handleError(error, { 
        context: "associate-documents-with-insight",
        projectId,
        insightId
      });
      return false;
    }
  },
  
  /**
   * Get documents associated with an insight
   */
  async getDocumentsForInsight(
    projectId: string, 
    insightId: string
  ): Promise<DocumentWithLifecycle[]> {
    try {
      validateProjectId(projectId);
      
      // Get storage keys
      const insightsStorageKey = STORAGE_KEYS.projectInsights(projectId);
      
      // Get insights
      const insightsData = await storage.getItem<{ insights: any[] }>(insightsStorageKey);
      
      if (!insightsData) {
        return [];
      }
      
      // Find the insight
      const insight = insightsData.insights.find(insight => insight.id === insightId);
      
      if (!insight || !insight.sourceDocuments || !Array.isArray(insight.sourceDocuments)) {
        return [];
      }
      
      // Get all documents for this project
      const documents = await this.fetchProjectDocuments(projectId);
      
      // Filter documents associated with this insight
      return documents.filter(doc => insight.sourceDocuments.includes(doc.id));
    } catch (error) {
      errorService.handleError(error, { 
        context: "get-documents-for-insight",
        projectId,
        insightId
      });
      return [];
    }
  }
};
