
import { useState, useEffect } from "react";
import { Document } from "@/lib/types";
import { calculateDocumentPriority } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDocuments = (projectId: string, userId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing documents when component mounts
  useEffect(() => {
    if (!projectId) return;
    
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error fetching documents:', error);
          toast({
            title: "Error fetching documents",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Convert retrieved documents to our Document type
          const fetchedDocs: Document[] = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            uploadedAt: doc.uploaded_at,
            uploadedBy: doc.user_id,
            url: doc.url,
            priority: doc.priority
          }));
          
          setDocuments(fetchedDocs);
        }
      } catch (err) {
        console.error('Unexpected error fetching documents:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, toast]);

  const uploadDocumentToStorage = async (file: File, userId: string, projectId: string): Promise<string | null> => {
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

  const handleFilesSelected = async (files: File[]) => {
    if (!userId || !projectId) return;
    
    setIsLoading(true);
    const newDocuments: Document[] = [];
    
    try {
      for (const file of files) {
        // Calculate priority
        const priority = calculateDocumentPriority(file.name);
        const timestamp = new Date().toISOString();
        
        // Upload file to storage
        const { storagePath, publicUrl } = await uploadDocumentToStorage(file, userId, projectId);
        
        // Create new document entry
        const newDoc: Document = {
          id: `temp_${Math.random().toString(36).substr(2, 9)}`, // Temporary ID before insertion
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: timestamp,
          uploadedBy: userId,
          url: publicUrl,
          priority
        };
        
        // Insert document into database
        const { data, error } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            size: file.size,
            type: file.type,
            project_id: projectId,
            user_id: userId,
            url: publicUrl,
            priority,
            storage_path: storagePath
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error inserting document into database:', error);
          toast({
            title: "Error uploading document",
            description: error.message,
            variant: "destructive",
          });
          continue; // Skip this file and continue with others
        }
        
        // Update the document with the real ID from the database
        if (data) {
          newDoc.id = data.id;
        }
        
        newDocuments.push(newDoc);
      }
      
      setDocuments(prev => [...prev, ...newDocuments]);
      
      toast({
        title: "Documents uploaded",
        description: `Successfully uploaded ${newDocuments.length} document${newDocuments.length !== 1 ? 's' : ''}`,
      });
    } catch (err) {
      console.error('Error uploading documents:', err);
      toast({
        title: "Error uploading documents",
        description: "Some documents could not be uploaded. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveDocument = async (documentId: string) => {
    try {
      // Find the document to get its storage path
      const docToRemove = documents.find(doc => doc.id === documentId);
      
      if (!docToRemove) {
        console.error('Document not found for removal:', documentId);
        return;
      }
      
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
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document removed",
        description: "Document has been removed from the project",
      });
    } catch (err) {
      console.error('Error removing document:', err);
      toast({
        title: "Error removing document",
        description: "The document could not be removed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    documents,
    isLoading,
    handleFilesSelected,
    handleRemoveDocument
  };
};
