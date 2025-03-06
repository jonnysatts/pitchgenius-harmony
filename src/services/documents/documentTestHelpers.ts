import { documentService, DocumentStatus, DocumentWithLifecycle } from "./documentService";
import { storage } from "../api/storageAdapter";
import { STORAGE_KEYS } from "../api/config";

/**
 * Helper functions for testing document-related functionality
 */

/**
 * Create a mock file for testing
 */
export function createMockFile(
  name: string = "test.pdf", 
  type: string = "application/pdf", 
  size: number = 1024
): File {
  // Create a mock file
  const blob = new Blob(["test content"], { type });
  return new File([blob], name, { type });
}

/**
 * Create mock documents for testing
 */
export async function createMockDocuments(
  projectId: string, 
  count: number = 3
): Promise<DocumentWithLifecycle[]> {
  const docs: DocumentWithLifecycle[] = [];
  
  for (let i = 0; i < count; i++) {
    const file = createMockFile(`test_${i}.pdf`);
    const doc = await documentService.uploadDocument(projectId, file);
    
    if (doc) {
      docs.push(doc);
    }
  }
  
  return docs;
}

/**
 * Clear all documents for a project
 */
export async function clearProjectDocuments(projectId: string): Promise<void> {
  const storageKey = STORAGE_KEYS.projectDocuments(projectId);
  await storage.removeItem(storageKey);
}

/**
 * Create test documents with different statuses
 */
export async function createDocumentsWithDifferentStatuses(
  projectId: string
): Promise<DocumentWithLifecycle[]> {
  // Clear existing documents
  await clearProjectDocuments(projectId);
  
  // Create documents
  const docs = await createMockDocuments(projectId, 4);
  
  if (docs.length < 4) {
    throw new Error("Failed to create enough test documents");
  }
  
  // Update document statuses
  await documentService.updateDocumentStatus(docs[0].id, DocumentStatus.PENDING);
  await documentService.updateDocumentStatus(docs[1].id, DocumentStatus.PROCESSED);
  await documentService.updateDocumentStatus(docs[2].id, DocumentStatus.ANALYZED);
  await documentService.updateDocumentStatus(docs[3].id, DocumentStatus.ERROR, "Test error");
  
  // Fetch the updated documents
  return await documentService.fetchProjectDocuments(projectId);
}

/**
 * Verify document lifecycle state
 */
export function verifyDocumentLifecycle(
  doc: DocumentWithLifecycle,
  expectedStatus: DocumentStatus,
  hasError: boolean = false
): boolean {
  // Check that document has the expected status
  if (doc.status !== expectedStatus) {
    console.error(`Document has incorrect status: ${doc.status}, expected: ${expectedStatus}`);
    return false;
  }
  
  // Check that status history exists and contains expected status
  if (!doc.statusHistory || doc.statusHistory.length === 0) {
    console.error("Document missing status history");
    return false;
  }
  
  // Check that the latest status in history matches current status
  const latestHistoryStatus = doc.statusHistory[doc.statusHistory.length - 1].status;
  if (latestHistoryStatus !== expectedStatus) {
    console.error(`Latest status in history (${latestHistoryStatus}) doesn't match current status (${expectedStatus})`);
    return false;
  }
  
  // Check error state
  if (hasError && !doc.processingError) {
    console.error("Document should have processing error");
    return false;
  }
  
  if (!hasError && doc.processingError) {
    console.error(`Document has unexpected processing error: ${doc.processingError}`);
    return false;
  }
  
  return true;
}

/**
 * Test document insights association
 */
export async function testDocumentInsightAssociation(
  projectId: string
): Promise<boolean> {
  try {
    // Create test documents
    const docs = await createMockDocuments(projectId, 3);
    
    if (docs.length < 3) {
      throw new Error("Failed to create enough test documents");
    }
    
    // Create a mock insight ID
    const insightId = `test_insight_${Date.now()}`;
    
    // Associate documents with the insight
    const success = await documentService.associateDocumentsWithInsight(
      projectId,
      insightId,
      docs.map(d => d.id)
    );
    
    if (!success) {
      throw new Error("Failed to associate documents with insight");
    }
    
    // Get documents for the insight
    const insightDocs = await documentService.getDocumentsForInsight(
      projectId,
      insightId
    );
    
    // Verify all documents are associated
    if (insightDocs.length !== docs.length) {
      console.error(`Expected ${docs.length} documents, found ${insightDocs.length}`);
      return false;
    }
    
    // Verify document IDs match
    const docIds = docs.map(d => d.id).sort();
    const insightDocIds = insightDocs.map(d => d.id).sort();
    
    for (let i = 0; i < docIds.length; i++) {
      if (docIds[i] !== insightDocIds[i]) {
        console.error(`Document ID mismatch: ${docIds[i]} vs ${insightDocIds[i]}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error testing document insight association:", error);
    return false;
  }
}

/**
 * Run all document service tests
 */
export async function runDocumentServiceTests(
  projectId: string
): Promise<{ success: boolean; results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};
  
  try {
    // Test 1: Create documents
    const docs = await createMockDocuments(projectId, 2);
    results.createDocuments = docs.length === 2;
    
    // Test 2: Update document status
    if (docs.length > 0) {
      await documentService.updateDocumentStatus(docs[0].id, DocumentStatus.PROCESSED);
      const updatedDocs = await documentService.fetchProjectDocuments(projectId);
      const updatedDoc = updatedDocs.find(d => d.id === docs[0].id);
      results.updateStatus = updatedDoc?.status === DocumentStatus.PROCESSED;
    }
    
    // Test 3: Remove document
    if (docs.length > 1) {
      const removeSuccess = await documentService.removeDocument(docs[1].id);
      const remainingDocs = await documentService.fetchProjectDocuments(projectId);
      results.removeDocument = removeSuccess && !remainingDocs.some(d => d.id === docs[1].id);
    }
    
    // Test 4: Document lifecycle tracking
    const lifecycleDocs = await createDocumentsWithDifferentStatuses(projectId);
    const pendingDoc = lifecycleDocs.find(d => d.status === DocumentStatus.PENDING);
    const errorDoc = lifecycleDocs.find(d => d.status === DocumentStatus.ERROR);
    
    results.lifecycleTracking = 
      !!pendingDoc && 
      !!errorDoc && 
      verifyDocumentLifecycle(pendingDoc, DocumentStatus.PENDING) &&
      verifyDocumentLifecycle(errorDoc, DocumentStatus.ERROR, true);
    
    // Test 5: Document insight association
    results.insightAssociation = await testDocumentInsightAssociation(projectId);
    
    // Clean up after tests
    await clearProjectDocuments(projectId);
    
    // Overall success
    const success = Object.values(results).every(r => r);
    
    return { success, results };
  } catch (error) {
    console.error("Error running document service tests:", error);
    
    // Return failed results
    return { 
      success: false, 
      results: {
        ...results,
        error: false
      }
    };
  }
}
