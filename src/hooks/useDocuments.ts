
import { useState, useEffect } from "react";
import { Document } from "@/lib/types";
import { calculateDocumentPriority } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchProjectDocuments, 
  uploadDocumentToStorage, 
  insertDocumentRecord, 
  removeDocument 
} from "@/services/documentStorage";

export const useDocuments = (projectId: string, userId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing documents when component mounts
  useEffect(() => {
    if (!projectId) return;
    
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchProjectDocuments(projectId);
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        toast({
          title: "Error fetching documents",
          description: err instanceof Error ? err.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [projectId, toast]);

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
      await removeDocument(documentId);
      
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
