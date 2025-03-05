
import { useState, useEffect } from "react";
import { useQueryDocuments } from "./useQueryDocuments";
import { Document } from "@/lib/types";

export const useDocuments = (projectId: string, userId: string) => {
  // Track failed uploads for better error reporting
  const [failedUploads, setFailedUploads] = useState<{
    filename: string;
    error: string;
  }[]>([]);
  
  const [hasRealDocuments, setHasRealDocuments] = useState(false);

  // Use React Query for document management
  const {
    documents,
    isLoading,
    error,
    addDocuments,
    removeDocument,
    refetch
  } = useQueryDocuments(projectId);
  
  // Check if we have real (non-mock) documents
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
      setHasRealDocuments(realDocs.length > 0);
      
      // If we have real documents but also mock ones, refetch to clear mocks
      if (realDocs.length > 0 && realDocs.length !== documents.length) {
        console.log("Found real documents, clearing mock documents");
        refetch();
      }
    }
  }, [documents, isLoading, refetch]);
  
  // Handle file selection - wrapper around addDocuments
  const handleFilesSelected = (files: File[]) => {
    try {
      // Clear any previous failed uploads
      setFailedUploads([]);
      
      // Add the documents
      addDocuments(files);
      
      // Force a refetch after adding documents to clear any mock documents
      setTimeout(() => {
        refetch();
      }, 500);
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
  
  // Filter function to get only real documents or all if no real ones exist
  const getDisplayDocuments = (): Document[] => {
    if (!documents || documents.length === 0) return [];
    
    const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
    return realDocs.length > 0 ? realDocs : documents;
  };
  
  // Public API
  return {
    documents: getDisplayDocuments(),
    isLoading,
    error: error ? String(error) : null,
    failedUploads,
    hasRealDocuments,
    handleFilesSelected,
    handleRemoveDocument: removeDocument
  };
};
