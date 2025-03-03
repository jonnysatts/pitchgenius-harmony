
import { useState, useEffect } from "react";
import { Document } from "@/lib/types";
import { useDocumentFetching } from "./useDocumentFetching";
import { useDocumentActions } from "./useDocumentActions";

export const useDocuments = (projectId: string, userId: string) => {
  // Use useEffect for initialization to avoid recreating state on every render
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track failed documents for better error reporting
  const [failedUploads, setFailedUploads] = useState<{
    filename: string;
    error: string;
  }[]>([]);

  // Use a separate function for document fetching to avoid recreation
  useDocumentFetching(projectId, setDocuments, setIsLoading, setError);
  
  // Handle document actions (upload, remove)
  const { handleFilesSelected, handleRemoveDocument } = useDocumentActions(
    projectId,
    userId,
    setDocuments,
    setIsLoading,
    setError,
    setFailedUploads
  );

  return {
    documents,
    isLoading,
    error,
    failedUploads,
    handleFilesSelected,
    handleRemoveDocument
  };
};
