
import { useState, useEffect, useCallback } from "react";
import { useQueryDocuments } from "./useQueryDocuments";
import { Document } from "@/lib/types";
import { toast } from "sonner";

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
    refetchDocuments
  } = useQueryDocuments(projectId);
  
  // Refetch documents when projectId changes
  useEffect(() => {
    if (projectId) {
      console.log(`Project ID changed to ${projectId}, refetching documents`);
      refetchDocuments();
    }
  }, [projectId, refetchDocuments]);
  
  // Periodically check for document persistence (every 30 seconds)
  useEffect(() => {
    if (!projectId) return;
    
    const interval = setInterval(() => {
      console.log("Running scheduled document persistence check");
      refetchDocuments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [projectId, refetchDocuments]);
  
  // Check if we have real (non-mock) documents
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
      const hasSavedDocs = realDocs.length > 0;
      
      setHasRealDocuments(hasSavedDocs);
      
      // If we have real documents but also mock ones, refetch to clear mocks
      if (hasSavedDocs && realDocs.length !== documents.length) {
        console.log("Found real documents, clearing mock documents");
        refetchDocuments();
      }
    }
  }, [documents, isLoading, refetchDocuments]);
  
  // Handle file selection - wrapper around addDocuments
  const handleFilesSelected = useCallback((files: File[]) => {
    if (!projectId) {
      toast.error("Cannot upload documents", {
        description: "No project ID available"
      });
      return;
    }
    
    try {
      // Clear any previous failed uploads
      setFailedUploads([]);
      
      if (files.length === 0) {
        console.warn("No files selected for upload");
        return;
      }
      
      console.log(`Adding ${files.length} documents to project ${projectId}`);
      
      // Add the documents
      addDocuments(files);
      
      // Force a refetch after adding documents to ensure persistence
      setTimeout(() => {
        refetchDocuments();
      }, 1000);
    } catch (err) {
      console.error("Error handling file selection:", err);
      setFailedUploads(
        files.map(file => ({
          filename: file.name,
          error: err instanceof Error ? err.message : "Unknown error uploading file"
        }))
      );
    }
  }, [projectId, addDocuments, refetchDocuments]);
  
  // Handle document removal with confirmation
  const handleRemoveDocument = useCallback((documentId: string) => {
    if (!documentId) return;
    
    console.log(`Removing document with ID: ${documentId}`);
    removeDocument(documentId);
    
    // Force a refetch after removing document
    setTimeout(() => {
      refetchDocuments();
    }, 500);
  }, [removeDocument, refetchDocuments]);
  
  // Filter function to get only real documents or all if no real ones exist
  const getDisplayDocuments = useCallback((): Document[] => {
    if (!documents || documents.length === 0) return [];
    
    const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
    return realDocs.length > 0 ? realDocs : documents;
  }, [documents]);
  
  // Public API
  return {
    documents: getDisplayDocuments(),
    isLoading,
    error: error ? String(error) : null,
    failedUploads,
    hasRealDocuments,
    handleFilesSelected,
    handleRemoveDocument
  };
};
