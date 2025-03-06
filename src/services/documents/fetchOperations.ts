import { Document } from "@/lib/types";
import { storage } from "../api/storageAdapter";
import { STORAGE_KEYS, DOCUMENT_CONFIG } from "../api/config";
import { documentService, DocumentWithLifecycle } from "./documentService";
import { migrateDocumentStorage } from "./documentMigration";
import { errorService, ErrorType } from "../error/errorService";

// Track if migration has been attempted
let migrationAttempted = false;

/**
 * Ensure document migration has run before performing document operations
 */
async function ensureMigration() {
  if (!migrationAttempted) {
    console.log("Running document migration check...");
    await migrateDocumentStorage();
    migrationAttempted = true;
  }
}

/**
 * @deprecated Use documentService.fetchProjectDocuments instead
 * Fetch all documents for a project
 */
export async function fetchProjectDocumentsFromApi(projectId: string): Promise<Document[]> {
  try {
    // Ensure migration has run
    await ensureMigration();
    
    // Use document service
    return await documentService.fetchProjectDocuments(projectId);
  } catch (error) {
    errorService.handleError(error, {
      context: "fetch-project-documents-legacy",
      projectId
    });
    return [];
  }
}

/**
 * @deprecated Use documentService.uploadDocument instead
 * Upload a document to a project
 */
export async function uploadDocumentToApi(
  projectId: string,
  file: File,
  priority: number = 0
): Promise<Document | null> {
  try {
    // Ensure migration has run
    await ensureMigration();
    
    // Validate file type
    if (!DOCUMENT_CONFIG.allowedDocumentTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    // Validate file size
    if (file.size > DOCUMENT_CONFIG.maxDocumentSize) {
      throw new Error(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds limit of ${DOCUMENT_CONFIG.maxDocumentSize / (1024 * 1024)}MB`);
    }
    
    // Use document service
    return await documentService.uploadDocument(projectId, file, priority);
  } catch (error) {
    errorService.handleError(error, {
      context: "upload-document-legacy",
      projectId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    return null;
  }
}

/**
 * @deprecated Use documentService.removeDocument instead
 * Remove a document
 */
export async function removeDocument(documentId: string): Promise<boolean> {
  try {
    // Ensure migration has run
    await ensureMigration();
    
    // Use document service
    return await documentService.removeDocument(documentId);
  } catch (error) {
    errorService.handleError(error, {
      context: "remove-document-legacy",
      documentId
    });
    return false;
  }
}

/**
 * @deprecated Use apiClient.insights.associateDocumentsWithInsight instead
 * Associate documents with an insight
 */
export async function associateDocumentsWithInsight(
  projectId: string,
  insightId: string,
  documentIds: string[]
): Promise<boolean> {
  try {
    // Ensure migration has run
    await ensureMigration();
    
    // Use document service
    return await documentService.associateDocumentsWithInsight(
      projectId,
      insightId,
      documentIds
    );
  } catch (error) {
    errorService.handleError(error, {
      context: "associate-documents-with-insight-legacy",
      projectId,
      insightId
    });
    return false;
  }
}

/**
 * @deprecated Use apiClient.documents.updateDocumentStatus instead
 * Update document status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: string,
  error?: string
): Promise<boolean> {
  try {
    // Ensure migration has run
    await ensureMigration();
    
    // Use document service
    return await documentService.updateDocumentStatus(
      documentId,
      status as any,
      error
    );
  } catch (error) {
    errorService.handleError(error, {
      context: "update-document-status-legacy",
      documentId,
      status
    });
    return false;
  }
}

/**
 * Run document migration manually
 */
export async function runDocumentMigration(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Starting manual document migration...");
    const success = await migrateDocumentStorage();
    
    migrationAttempted = true;
    
    if (success) {
      return {
        success: true,
        message: "Document migration completed successfully"
      };
    } else {
      return {
        success: false,
        message: "Document migration failed"
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errorService.handleError(error, {
      context: "manual-document-migration"
    });
    
    return {
      success: false,
      message: `Document migration failed: ${errorMessage}`
    };
  }
}
