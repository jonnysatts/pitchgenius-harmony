
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  removeDocument,
  DatabaseError,
  DocumentNotFoundError,
  AuthenticationError
} from "@/services/documents";

export const useDocumentRemoval = (
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
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
  
  return { handleRemoveDocument };
};
