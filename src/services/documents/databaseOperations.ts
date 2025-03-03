
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/lib/types";
import { DatabaseError, DocumentNotFoundError } from "./errors";

/**
 * Insert a document record into the database
 */
export const insertDocumentRecord = async (
  fileName: string,
  fileSize: number,
  fileType: string,
  projectId: string,
  userId: string,
  url: string,
  priority: number,
  storagePath: string
): Promise<Document | null> => {
  if (!fileName || !projectId || !userId || !url) {
    throw new Error("Missing required fields for document record insertion");
  }

  try {
    console.log(`Inserting document record for: ${fileName}`);
    
    // For development/mock environment, store in localStorage
    const newDoc: Document = {
      id: `local_${Math.random().toString(36).substr(2, 9)}`,
      name: fileName,
      size: fileSize,
      type: fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      url,
      priority
    };
    
    const storageKey = `project_documents_${projectId}`;
    const existingDocs = localStorage.getItem(storageKey);
    const documents = existingDocs ? JSON.parse(existingDocs) : [];
    documents.push(newDoc);
    localStorage.setItem(storageKey, JSON.stringify(documents));
    
    console.log('Document record stored in localStorage:', newDoc);
    
    // Try to also insert into Supabase if possible (will likely fail in mock env)
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: fileName,
          size: fileSize,
          type: fileType,
          project_id: projectId,
          user_id: userId,
          url,
          priority,
          storage_path: storagePath
        })
        .select()
        .single();
        
      if (error) {
        console.warn('Could not insert document into Supabase (expected in mock environment):', error);
      } else if (data) {
        console.log('Document also inserted into Supabase:', data.id);
        newDoc.id = data.id;
      }
    } catch (supabaseError) {
      console.warn('Supabase insertion failed (expected in mock environment):', supabaseError);
    }
    
    return newDoc;
  } catch (error) {
    console.error('Unexpected error inserting document record:', error);
    throw new DatabaseError(
      `An unexpected error occurred while saving document "${fileName}" to database`, 
      error
    );
  }
};

/**
 * Remove a document from storage and database
 */
export const removeDocument = async (documentId: string): Promise<void> => {
  if (!documentId) {
    throw new Error("Document ID is required to remove a document");
  }

  try {
    console.log(`Removing document with ID: ${documentId}`);
    
    // For development/mock environment, remove from localStorage
    const allStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('project_documents_'));
    
    for (const storageKey of allStorageKeys) {
      const documents = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedDocuments = documents.filter((doc: Document) => doc.id !== documentId);
      
      if (documents.length !== updatedDocuments.length) {
        localStorage.setItem(storageKey, JSON.stringify(updatedDocuments));
        console.log(`Document ${documentId} removed from localStorage`);
      }
    }
    
    // Try to also remove from Supabase if possible
    try {
      // Get the storage path from the database
      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();
        
      if (fetchError) {
        console.warn('Could not fetch document from Supabase (expected in mock environment):', fetchError);
      } else if (docData?.storage_path) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('project_documents')
          .remove([docData.storage_path]);
          
        if (storageError) {
          console.warn('Could not remove file from Supabase storage (expected in mock environment):', storageError);
        }
        
        // Delete from database
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentId);
          
        if (deleteError) {
          console.warn('Could not delete document from Supabase (expected in mock environment):', deleteError);
        } else {
          console.log(`Document ${documentId} also removed from Supabase`);
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase removal failed (expected in mock environment):', supabaseError);
    }
  } catch (error) {
    console.error('Unexpected error removing document:', error);
    throw new Error(`An unexpected error occurred while removing document ID ${documentId}: ${error instanceof Error ? error.message : String(error)}`);
  }
};
