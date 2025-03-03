
import { useEffect, useRef } from "react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchProjectDocuments,
  DatabaseError,
  AuthenticationError
} from "@/services/documents";

export const useDocumentFetching = (
  projectId: string,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { toast } = useToast();
  const hasFetchedRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!projectId) return;
    
    // Only fetch if we haven't already fetched for this projectId
    if (hasFetchedRef.current) return;
    
    console.log("Fetching documents for project:", projectId);
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const docs = await fetchProjectDocuments(projectId);
        console.log("Fetched documents:", docs);
        setDocuments(docs);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error('Error fetching documents:', err);
        
        let errorMessage = "Failed to load documents";
        
        if (err instanceof DatabaseError) {
          errorMessage = `Database error: ${err.message}`;
        } else if (err instanceof AuthenticationError) {
          // For mock environment, we'll suppress auth errors in fetching
          console.warn("Authentication error when fetching documents, but continuing with empty list");
          setDocuments([]);
          setIsLoading(false);
          return;
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
    
    // Cleanup function to reset the fetch state when component unmounts
    return () => {
      hasFetchedRef.current = false;
    };
  }, [projectId, toast, setDocuments, setIsLoading, setError]);
};
