
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AuthenticationError } from "@/services/documents/errors";

export const useFileSelection = (
  userId: string,
  projectId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFailedUploads: React.Dispatch<React.SetStateAction<{filename: string; error: string}[]>>,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const { toast } = useToast();
  
  const validateFilesSelection = async (files: File[]) => {
    if (!userId || !projectId) {
      toast({
        title: "Upload error",
        description: "Missing user ID or project ID",
        variant: "destructive",
      });
      return false;
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
      
      // Check against current document count
      let exceedsLimit = false;
      
      setDocuments(prev => {
        // Check against limit with current documents
        if (prev.length + files.length > maxFiles) {
          exceedsLimit = true;
          setIsLoading(false);
          toast({
            title: "Too many files",
            description: `You can upload a maximum of ${maxFiles} documents in total.`,
            variant: "destructive"
          });
        }
        return prev;
      });
      
      return !exceedsLimit;
      
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
      return false;
    }
  };
  
  return { validateFilesSelection };
};
