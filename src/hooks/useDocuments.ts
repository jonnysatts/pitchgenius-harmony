
import { useState, useEffect } from "react";
import { Document } from "@/lib/types";
import { calculateDocumentPriority } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchProjectDocuments, 
  uploadDocumentToStorage, 
  insertDocumentRecord, 
  removeDocument,
  StorageUploadError,
  DatabaseError,
  DocumentNotFoundError,
  AuthenticationError
} from "@/services/documentStorage";

export const useDocuments = (projectId: string, userId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch existing documents when component mounts
  useEffect(() => {
    if (!projectId) return;
    
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const docs = await fetchProjectDocuments(projectId);
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        
        let errorMessage = "Failed to load documents";
        
        if (err instanceof DatabaseError) {
          errorMessage = `Database error: ${err.message}`;
        } else if (err instanceof AuthenticationError) {
          errorMessage = "You need to be logged in to view documents";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        
        toast({
          title: "Error fetching documents",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [projectId, toast]);

  const handleFilesSelected = async (files: File[]) => {
    if (!userId || !projectId) {
      toast({
        title: "Upload error",
        description: "Missing user ID or project ID",
        variant: "destructive",
      });
      return;
    }
    
    // Check if adding these files would exceed max files
    // We add this check early to prevent starting uploads that would exceed the limit
    const maxFiles = 20; // Same as in the FileUpload component 
    if (documents.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${maxFiles} documents in total.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const newDocuments: Document[] = [];
    let failedUploads = 0;
    
    try {
      for (const file of files) {
        try {
          // Calculate priority
          const priority = calculateDocumentPriority(file.name);
          const timestamp = new Date().toISOString();
          
          // Upload file to storage
          const uploadResult = await uploadDocumentToStorage(file, userId, projectId);
          const { storagePath, publicUrl } = uploadResult;
          
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
          const insertedDoc = await insertDocumentRecord(
            file.name,
            file.size,
            file.type,
            projectId,
            userId,
            publicUrl,
            priority,
            storagePath
          );
            
          if (insertedDoc) {
            newDoc.id = insertedDoc.id;
          }
          
          newDocuments.push(newDoc);
        } catch (fileError) {
          failedUploads++;
          console.error(`Error uploading file ${file.name}:`, fileError);
          
          // Track the individual file error but continue with other files
          let errorMessage = `Failed to upload ${file.name}`;
          
          if (fileError instanceof StorageUploadError) {
            errorMessage = `Storage error: ${fileError.message}`;
          } else if (fileError instanceof DatabaseError) {
            errorMessage = `Database error: ${fileError.message}`;
          } else if (fileError instanceof AuthenticationError) {
            errorMessage = "You need to be logged in to upload documents";
            // Break the loop as auth errors will affect all uploads
            break;
          } else if (fileError instanceof Error) {
            errorMessage = fileError.message;
          }
          
          toast({
            title: `Error uploading ${file.name}`,
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
      
      if (newDocuments.length > 0) {
        setDocuments(prev => [...prev, ...newDocuments]);
      
        toast({
          title: "Documents uploaded",
          description: `Successfully uploaded ${newDocuments.length} document${newDocuments.length !== 1 ? 's' : ''}${failedUploads > 0 ? ` (${failedUploads} failed)` : ''}`,
          variant: failedUploads > 0 ? "default" : "default",
        });
      } else if (failedUploads > 0) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${failedUploads} document${failedUploads !== 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error in batch document upload:', err);
      
      let errorMessage = "Error uploading documents";
      
      if (err instanceof AuthenticationError) {
        errorMessage = "You need to be logged in to upload documents";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error uploading documents",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveDocument = async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await removeDocument(documentId);
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document removed",
        description: "Document has been removed from the project",
      });
    } catch (err) {
      console.error('Error removing document:', err);
      
      let errorMessage = "Failed to remove document";
      
      if (err instanceof DatabaseError) {
        errorMessage = `Database error: ${err.message}`;
      } else if (err instanceof DocumentNotFoundError) {
        errorMessage = err.message;
        // Still remove from local state if the document wasn't found in the database
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else if (err instanceof AuthenticationError) {
        errorMessage = "You need to be logged in to remove documents";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Error removing document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    error,
    handleFilesSelected,
    handleRemoveDocument
  };
};
