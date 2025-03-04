
import { Document } from "@/lib/types";
import { useDocumentUpload } from "./useDocumentUpload";
import { useFileSelection } from "./useFileSelection";
import { useDocumentRemoval } from "./useDocumentRemoval";

export const useDocumentActions = (
  projectId: string,
  userId: string,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFailedUploads: React.Dispatch<React.SetStateAction<{filename: string; error: string}[]>>
) => {
  // Use the document removal hook
  const { handleRemoveDocument } = useDocumentRemoval(
    setDocuments,
    setIsLoading,
    setError
  );
  
  // Use the file selection validation hook
  const { validateFilesSelection } = useFileSelection(
    userId,
    projectId,
    setIsLoading,
    setError,
    setFailedUploads,
    setDocuments
  );
  
  // Use the document upload hook
  const { processFileUploads } = useDocumentUpload(
    projectId,
    userId,
    setDocuments,
    setIsLoading,
    setError,
    setFailedUploads
  );
  
  // Main function to handle file selection from the UI
  const handleFilesSelected = async (files: File[]) => {
    // Validate files and ensure we're not exceeding limits
    const isValid = await validateFilesSelection(files);
    
    if (isValid) {
      // If validation passes, proceed with upload
      await processFileUploads(files, projectId, userId);
    }
  };
  
  return {
    handleFilesSelected,
    handleRemoveDocument
  };
};
