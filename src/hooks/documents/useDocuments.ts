
import { useState } from "react";
import { useQueryDocuments } from "./useQueryDocuments";

export const useDocuments = (projectId: string, userId: string) => {
  // Track failed uploads for better error reporting
  const [failedUploads, setFailedUploads] = useState<{
    filename: string;
    error: string;
  }[]>([]);

  // Use React Query for document management
  const {
    documents,
    isLoading,
    error,
    addDocuments,
    removeDocument
  } = useQueryDocuments(projectId);
  
  // Handle file selection - wrapper around addDocuments
  const handleFilesSelected = (files: File[]) => {
    try {
      // Clear any previous failed uploads
      setFailedUploads([]);
      
      // Add the documents
      addDocuments(files);
    } catch (err) {
      console.error("Error handling file selection:", err);
      setFailedUploads(
        files.map(file => ({
          filename: file.name,
          error: err instanceof Error ? err.message : "Unknown error uploading file"
        }))
      );
    }
  };
  
  // Public API
  return {
    documents,
    isLoading,
    error: error ? String(error) : null,
    failedUploads,
    handleFilesSelected,
    handleRemoveDocument: removeDocument
  };
};
