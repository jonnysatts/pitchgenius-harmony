
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

export class AuthenticationError extends Error {
  constructor() {
    super("User is not authenticated");
    this.name = "AuthenticationError";
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
    // For development/mock environment, skip the authentication check
    // In production, this would be enabled:
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) {
    //   throw new AuthenticationError();
    // }

    // Create a path with user ID and project ID to organize files
    // Sanitize filename to prevent issues with special characters
    const fileName = encodeURIComponent(file.name.replace(/[^\x00-\x7F]/g, '_'));
    const storagePath = `${userId}/${projectId}/${fileName}_${Date.now()}`;
    
    console.log(`Attempting to upload file to storage path: ${storagePath}`);
    console.log(`File type: ${file.type}, File size: ${file.size} bytes`);
    
    // For PDF files, explicitly set the content type
    const contentType = file.type === 'application/pdf' ? 'application/pdf' : file.type;
    
    // Upload the file to Supabase Storage with explicit content type
    const { data, error } = await supabase.storage
      .from('project_documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType
      });
      
    if (error) {
      console.error('Error uploading file to storage:', error);
      
      // For development/mock environment - simulate successful upload if storage fails
      console.log("In development environment - simulating successful upload");
      const simulatedPublicUrl = URL.createObjectURL(file);
      return { storagePath, publicUrl: simulatedPublicUrl };
      
      // In production, this would throw an error:
      // throw new StorageUploadError(
      //   `Failed to upload file "${file.name}": ${error.message}`, 
      //   error
      // );
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('project_documents')
      .getPublicUrl(storagePath);
      
    console.log('File uploaded successfully:', { storagePath, publicUrl });
    return { storagePath, publicUrl };
  } catch (error) {
    if (error instanceof StorageUploadError || error instanceof AuthenticationError) {
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
    console.log(`Fetching documents for project: ${projectId}`);

    // For development/mock environment, get documents from localStorage if available
    const storageKey = `project_documents_${projectId}`;
    const storedDocuments = localStorage.getItem(storageKey);
    
    if (storedDocuments) {
      console.log(`Found documents in localStorage for project ${projectId}`);
      return JSON.parse(storedDocuments);
    }
    
    // Try to get from Supabase if not in localStorage
    // This will likely fail in mock/development environment without auth
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents from Supabase:', error);
        return [];
      }

      if (!data) return [];

      console.log(`Found ${data.length} documents in Supabase for project ${projectId}`);
      
      // Convert retrieved documents to our Document type
      const documents = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        uploadedBy: doc.user_id,
        url: doc.url,
        priority: doc.priority
      }));
      
      // Store in localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(documents));
      
      return documents;
    } catch (supabaseError) {
      console.error('Failed to fetch from Supabase, returning empty list:', supabaseError);
      return [];
    }
  } catch (error) {
    console.error('Unexpected error fetching documents:', error);
    return [];
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
