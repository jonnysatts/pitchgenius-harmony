import { Document } from "@/lib/types";
import { storage } from "../api/storageAdapter";
import { STORAGE_KEYS } from "../api/config";
import { documentService, DocumentStatus, DocumentWithLifecycle } from "./documentService";
import { errorService, ErrorType } from "../error/errorService";

// Migration version tracking
const MIGRATION_VERSION = "1.0";
const MIGRATION_COMPLETED_KEY = "document_migration_completed";

/**
 * Checks if migration has been completed
 */
async function hasMigrationCompleted(): Promise<boolean> {
  try {
    const migrationStatus = await storage.getItem<{ completed: boolean, version: string }>(MIGRATION_COMPLETED_KEY);
    return migrationStatus?.completed && migrationStatus?.version === MIGRATION_VERSION;
  } catch (error) {
    return false;
  }
}

/**
 * Marks migration as completed
 */
async function markMigrationCompleted(): Promise<void> {
  await storage.setItem(MIGRATION_COMPLETED_KEY, {
    completed: true,
    version: MIGRATION_VERSION,
    timestamp: new Date().toISOString()
  });
}

/**
 * Ensures documents have the proper lifecycle format
 */
function ensureLifecycleFormat(doc: Document): DocumentWithLifecycle {
  // If document already has lifecycle info, return as is
  if ('status' in doc && 'statusHistory' in doc) {
    return doc as DocumentWithLifecycle;
  }
  
  // Add lifecycle info
  const timestamp = doc.uploadedAt || new Date().toISOString();
  
  return {
    ...doc,
    status: DocumentStatus.UPLOADED,
    statusHistory: [
      { status: DocumentStatus.UPLOADED, timestamp }
    ]
  };
}

/**
 * Get all project IDs from storage
 */
async function getAllProjectIds(): Promise<string[]> {
  try {
    // Look for project-related keys
    const projectKeys = await storage.getAllKeys("project_");
    
    // Extract project IDs from keys
    const projectIds = new Set<string>();
    
    for (const key of projectKeys) {
      // Extract project ID from various key formats
      if (key.startsWith("project_documents_")) {
        const projectId = key.replace("project_documents_", "");
        projectIds.add(projectId);
      } else if (key.startsWith("project_")) {
        const projectId = key.replace("project_", "");
        projectIds.add(projectId);
      }
    }
    
    return Array.from(projectIds);
  } catch (error) {
    errorService.handleError(error, { context: "get-all-project-ids" });
    return [];
  }
}

/**
 * Find documents with no project ID and associate them with the correct project
 */
async function associateOrphanedDocuments(): Promise<number> {
  try {
    // Get all old document keys that don't follow project convention
    const oldDocKeys = await storage.getAllKeys("document_");
    
    if (oldDocKeys.length === 0) {
      return 0;
    }
    
    // Get all project IDs
    const projectIds = await getAllProjectIds();
    
    if (projectIds.length === 0) {
      console.warn("No projects found for associating orphaned documents");
      return 0;
    }
    
    let associatedCount = 0;
    
    // Associate each orphaned document with the first project
    for (const key of oldDocKeys) {
      const doc = await storage.getItem<Document>(key);
      
      if (doc) {
        // Add the document to the first project
        const targetProject = doc.projectId || projectIds[0];
        const projectKey = STORAGE_KEYS.projectDocuments(targetProject);
        
        // Get existing project documents
        const projectDocs = await storage.getItem<Document[]>(projectKey) || [];
        
        // Check if document already exists in project
        if (!projectDocs.some(d => d.id === doc.id)) {
          // Ensure document has lifecycle format and correct project ID
          const updatedDoc = ensureLifecycleFormat({
            ...doc,
            projectId: targetProject
          });
          
          // Add document to project
          projectDocs.push(updatedDoc);
          await storage.setItem(projectKey, projectDocs);
          associatedCount++;
        }
        
        // Remove the old document
        await storage.removeItem(key);
      }
    }
    
    return associatedCount;
  } catch (error) {
    errorService.handleError(error, { context: "associate-orphaned-documents" });
    return 0;
  }
}

/**
 * Ensure all documents have the correct lifecycle format
 */
async function updateDocumentLifecycles(): Promise<number> {
  try {
    // Get all project document keys
    const projectDocKeys = await storage.getAllKeys("project_documents_");
    let updatedCount = 0;
    
    for (const key of projectDocKeys) {
      const projectId = key.replace("project_documents_", "");
      const docs = await storage.getItem<Document[]>(key) || [];
      
      // Check if any documents need updating
      const needsUpdate = docs.some(doc => !('status' in doc) || !('statusHistory' in doc));
      
      if (needsUpdate) {
        // Update all documents to ensure consistency
        const updatedDocs = docs.map(doc => ensureLifecycleFormat({
          ...doc,
          projectId: projectId // Ensure project ID is set correctly
        }));
        
        // Remove duplicates based on document ID
        const uniqueDocs = updatedDocs.filter((doc, index, self) => 
          index === self.findIndex(d => d.id === doc.id)
        );
        
        // Save updated documents
        await storage.setItem(key, uniqueDocs);
        updatedCount += uniqueDocs.length;
      }
    }
    
    return updatedCount;
  } catch (error) {
    errorService.handleError(error, { context: "update-document-lifecycles" });
    return 0;
  }
}

/**
 * Ensure document insight associations are properly stored
 */
async function updateDocumentInsightAssociations(): Promise<number> {
  try {
    // Get all project IDs
    const projectIds = await getAllProjectIds();
    let updatedCount = 0;
    
    for (const projectId of projectIds) {
      // Get insights for this project
      const insightKey = STORAGE_KEYS.projectInsights(projectId);
      const insightData = await storage.getItem<{ insights: any[] }>(insightKey);
      
      if (insightData?.insights && insightData.insights.length > 0) {
        // Get documents for this project
        const docs = await documentService.fetchProjectDocuments(projectId);
        
        // Check each insight for source document associations
        for (const insight of insightData.insights) {
          if (insight.sourceDocumentIds && insight.sourceDocumentIds.length > 0) {
            // Find the documents that are associated with this insight
            const associatedDocs = docs.filter(doc => 
              insight.sourceDocumentIds.includes(doc.id)
            );
            
            if (associatedDocs.length > 0) {
              // Update each document to ensure the association is properly stored
              for (const doc of associatedDocs) {
                const docWithInsights = {
                  ...doc,
                  associatedInsights: doc.associatedInsights || []
                };
                
                // Add this insight ID if not already associated
                if (!docWithInsights.associatedInsights.includes(insight.id)) {
                  docWithInsights.associatedInsights.push(insight.id);
                  await documentService.updateDocumentStatus(
                    doc.id,
                    doc.status,
                    doc.processingError
                  );
                  updatedCount++;
                }
              }
            }
          }
        }
      }
    }
    
    return updatedCount;
  } catch (error) {
    errorService.handleError(error, { context: "update-document-insight-associations" });
    return 0;
  }
}

/**
 * Migrates document storage to the new format
 */
export async function migrateDocumentStorage(): Promise<boolean> {
  try {
    // Check if migration has already been completed
    if (await hasMigrationCompleted()) {
      return true;
    }
    
    console.log("Starting document storage migration");
    
    // Step 1: Associate orphaned documents with projects
    const associatedCount = await associateOrphanedDocuments();
    console.log(`Associated ${associatedCount} orphaned documents with projects`);
    
    // Step 2: Update document lifecycles
    const updatedCount = await updateDocumentLifecycles();
    console.log(`Updated ${updatedCount} documents with lifecycle information`);
    
    // Step 3: Update document insight associations
    const associationsCount = await updateDocumentInsightAssociations();
    console.log(`Updated ${associationsCount} document-insight associations`);
    
    // Mark migration as completed
    await markMigrationCompleted();
    console.log("Document storage migration completed successfully");
    
    return true;
  } catch (error) {
    errorService.handleError(error, { 
      context: "document-migration",
      type: ErrorType.UNKNOWN_ERROR
    });
    return false;
  }
}

/**
 * Run migration for a specific project
 */
export async function migrateProjectDocuments(projectId: string): Promise<boolean> {
  try {
    console.log(`Starting document migration for project ${projectId}`);
    
    // Get all documents for this project
    const projectKey = STORAGE_KEYS.projectDocuments(projectId);
    const docs = await storage.getItem<Document[]>(projectKey) || [];
    
    // Update documents with lifecycle information
    const updatedDocs = docs.map(doc => ensureLifecycleFormat({
      ...doc,
      projectId: projectId // Ensure project ID is set correctly
    }));
    
    // Remove duplicates
    const uniqueDocs = updatedDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );
    
    // Save updated documents
    await storage.setItem(projectKey, uniqueDocs);
    
    console.log(`Updated ${uniqueDocs.length} documents for project ${projectId}`);
    
    return true;
  } catch (error) {
    errorService.handleError(error, { 
      context: "project-document-migration",
      projectId
    });
    return false;
  }
}
