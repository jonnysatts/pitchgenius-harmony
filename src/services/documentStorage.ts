
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/lib/types";

// Define custom error classes for better error handling
export class StorageUploadError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = "StorageUploadError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DocumentNotFoundError extends Error {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`);
    this.name = "DocumentNotFoundError";
  }
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadDocumentToStorage = async (
  file: File, 
  userId: string, 
  projectId: string
): Promise<{storagePath: string, publicUrl: string}> => {
  if (!file) {
    throw new Error("No file provided for upload");
  }
  
  if (!userId || !projectId) {
    throw new Error("User ID and Project ID are required for document upload");
  }

  try {
    // Create a path with user ID and project ID to organize files
    const storagePath = `${userId}/${projectId}/${file.name}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('project_documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading file to storage:', error);
      throw new StorageUploadError(
        `Failed to upload file "${file.name}": ${error.message}`, 
        error
      );
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('project_documents')
      .getPublicUrl(storagePath);
      
    return { storagePath, publicUrl };
  } catch (error) {
    if (error instanceof StorageUploadError) {
      throw error;
    }
    console.error('Unexpected error during file upload:', error);
    throw new StorageUploadError(
      `An unexpected error occurred while uploading "${file.name}"`, 
      error
    );
  }
};

/**
 * Fetch documents for a specific project
 */
export const fetchProjectDocuments = async (projectId: string): Promise<Document[]> => {
  if (!projectId) {
    throw new Error("Project ID is required to fetch documents");
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new DatabaseError(`Failed to fetch documents for project: ${error.message}`, error);
    }

    if (!data) return [];

    // Convert retrieved documents to our Document type
    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      uploadedAt: doc.uploaded_at,
      uploadedBy: doc.user_id,
      url: doc.url,
      priority: doc.priority
    }));
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    console.error('Unexpected error fetching documents:', error);
    throw new DatabaseError(`An unexpected error occurred while fetching documents`, error);
  }
};

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
      console.error('Error inserting document into database:', error);
      throw new DatabaseError(
        `Failed to save document record for "${fileName}": ${error.message}`, 
        error
      );
    }
    
    if (!data) return null;
    
    // Convert to Document type
    return {
      id: data.id,
      name: data.name,
      size: data.size,
      type: data.type,
      uploadedAt: data.uploaded_at,
      uploadedBy: data.user_id,
      url: data.url,
      priority: data.priority
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
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
    // Get the storage path from the database
    const { data: docData, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching document storage path:', fetchError);
      throw new DatabaseError(
        `Could not locate document with ID ${documentId}: ${fetchError.message}`, 
        fetchError
      );
    }
    
    if (!docData) {
      throw new DocumentNotFoundError(documentId);
    }
    
    if (docData?.storage_path) {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project_documents')
        .remove([docData.storage_path]);
        
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Log but continue to database deletion
        console.warn(`Failed to remove file from storage, but will proceed with database cleanup. Path: ${docData.storage_path}`);
      }
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
      
    if (deleteError) {
      console.error('Error deleting document from database:', deleteError);
      throw new DatabaseError(
        `Failed to remove document record for ID ${documentId}: ${deleteError.message}`, 
        deleteError
      );
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof DocumentNotFoundError) {
      throw error;
    }
    console.error('Unexpected error removing document:', error);
    throw new Error(`An unexpected error occurred while removing document ID ${documentId}: ${error instanceof Error ? error.message : String(error)}`);
  }
};
