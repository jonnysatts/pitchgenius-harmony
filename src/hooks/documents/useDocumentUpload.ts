
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  uploadDocumentToStorage, 
  insertDocumentRecord, 
  StorageUploadError,
  DatabaseError,
  AuthenticationError
} from "@/services/documents";
import { calculateDocumentPriority } from "@/services/documentService";

export const useDocumentUpload = (
  projectId: string,
  userId: string,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFailedUploads: React.Dispatch<React.SetStateAction<{filename: string; error: string}[]>>
) => {
  const { toast } = useToast();
  
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
  
  return { processFileUploads };
};
