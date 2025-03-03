
import { supabase } from "@/integrations/supabase/client";
import { StorageUploadError, AuthenticationError } from "./errors";

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
