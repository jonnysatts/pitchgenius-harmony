
import { useState } from "react";
import { Document } from "@/lib/types";
import { useDocumentFetching } from "./useDocumentFetching";
import { useDocumentActions } from "./useDocumentActions";

export const useDocuments = (projectId: string, userId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track failed documents for better error reporting
  const [failedUploads, setFailedUploads] = useState<{
    filename: string;
    error: string;
  }[]>([]);

  // Handle document fetching
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
