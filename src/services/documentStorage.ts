
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/lib/types";

/**
 * Upload a file to Supabase Storage
 */
export const uploadDocumentToStorage = async (
  file: File, 
  userId: string, 
  projectId: string
): Promise<{storagePath: string, publicUrl: string}> => {
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
    throw error;
  }
  
  // Get the public URL for the file
  const { data: { publicUrl } } = supabase.storage
    .from('project_documents')
    .getPublicUrl(storagePath);
    
  return { storagePath, publicUrl };
};

/**
 * Fetch documents for a specific project
 */
export const fetchProjectDocuments = async (projectId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
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
    throw error;
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
};

/**
 * Remove a document from storage and database
 */
export const removeDocument = async (documentId: string): Promise<void> => {
  // Get the storage path from the database
  const { data: docData, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching document storage path:', fetchError);
    throw fetchError;
  }
  
  if (docData?.storage_path) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project_documents')
      .remove([docData.storage_path]);
      
    if (storageError) {
      console.error('Error removing file from storage:', storageError);
      // Continue anyway to remove from database
    }
  }
  
  // Delete from database
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
    
  if (deleteError) {
    console.error('Error deleting document from database:', deleteError);
    throw deleteError;
  }
};
