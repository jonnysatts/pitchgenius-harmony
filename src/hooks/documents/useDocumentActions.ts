import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  uploadDocumentToStorage, 
  insertDocumentRecord, 
  removeDocument,
  StorageUploadError,
  DatabaseError,
  DocumentNotFoundError,
  AuthenticationError
} from "@/services/documents";
import { calculateDocumentPriority } from "@/services/documentService";

export const useDocumentActions = (
  projectId: string,
  userId: string,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFailedUploads: React.Dispatch<React.SetStateAction<{filename: string; error: string}[]>>
) => {
  const { toast } = useToast();
  
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
  
  const handleFilesSelected = async (files: File[]) => {
    if (!userId || !projectId) {
      toast({
        title: "Upload error",
        description: "Missing user ID or project ID",
        variant: "destructive",
      });
      return;
    }
    
    // Reset failed uploads
    setFailedUploads([]);
    
    // Check if adding these files would exceed max files
    // We add this check early to prevent starting uploads that would exceed the limit
    const maxFiles = 20; // Same as in the FileUpload component 
    
    // We need to check current document count before proceeding
    try {
      setIsLoading(true);
      
      // In development/mock environment, we don't check for auth session
      // In production, we would check with Supabase
      const isAuthenticated = !!userId;
      
      if (!isAuthenticated) {
        throw new AuthenticationError();
      }
      
      setDocuments(prev => {
        // Check against limit with current documents
        if (prev.length + files.length > maxFiles) {
          setIsLoading(false);
          toast({
            title: "Too many files",
            description: `You can upload a maximum of ${maxFiles} documents in total.`,
            variant: "destructive"
          });
          return prev;
        }
        return prev;
      });
      
      // Continue with upload if we didn't exceed the limit
      await processFileUploads(files, projectId, userId);
      
    } catch (err) {
      console.error('Error checking auth or limits:', err);
      let errorMessage = "Error checking document limits";
      
      if (err instanceof AuthenticationError) {
        errorMessage = "You need to be logged in to upload documents";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Upload error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const processFileUploads = async (files: File[], projectId: string, userId: string) => {
    const newDocuments: Document[] = [];
    let failedUploads = 0;
    let failedDocuments: {filename: string; error: string}[] = [];
    
    try {
      for (const file of files) {
        try {
          // Calculate priority
          const priority = calculateDocumentPriority(file.name);
          const timestamp = new Date().toISOString();
          
          // Upload file to storage
          const uploadResult = await uploadDocumentToStorage(file, userId, projectId);
          const { storagePath, publicUrl } = uploadResult;
          
          // Create new document entry with required fields
          const newDoc: Document = {
            id: `temp_${Math.random().toString(36).substr(2, 9)}`, // Temporary ID before insertion
            name: file.name,
            size: file.size,
            type: file.type,
            projectId: projectId,
            createdAt: new Date(),
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
            // Add to failed documents but don't break the loop - others might succeed
            failedDocuments.push({
              filename: file.name,
              error: errorMessage
            });
            continue;
          } else if (fileError instanceof Error) {
            errorMessage = fileError.message;
          }
          
          failedDocuments.push({
            filename: file.name,
            error: errorMessage
          });
          
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
      
      // Set failed uploads for user reference
      if (failedDocuments.length > 0) {
        setFailedUploads(failedDocuments);
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
  
  return {
    handleFilesSelected,
    handleRemoveDocument
  };
};
