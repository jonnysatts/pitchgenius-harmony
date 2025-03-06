import { useState, useEffect, useCallback } from "react";
import { useQueryDocuments } from "./useQueryDocuments";
import { Document } from "@/lib/types";
import { toast } from "sonner";
import { errorService } from "../../services/error/errorService";
import { DOCUMENT_CONFIG } from "../../services/api/config";

/**
 * Hook for document management with consistent document counting and error handling
 */
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
  
  // Check if we have real (non-mock) documents consistently
  useEffect(() => {
    if (!isLoading && documents) {
      // Use a more reliable way to detect real documents
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
      errorService.handleError(new Error("No project ID available"), {
        context: "document-upload",
        projectId: "none"
      });
      
      toast.error("Cannot upload documents", {
        description: "No project ID available. Please try again later.",
        duration: 5000
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
      
      // Validate files before uploading
      const invalidFiles = files.filter(file => {
        if (!DOCUMENT_CONFIG.allowedDocumentTypes.includes(file.type)) {
          return { file, reason: `Unsupported file type: ${file.type}` };
        }
        
        if (file.size > DOCUMENT_CONFIG.maxDocumentSize) {
          return { 
            file, 
            reason: `File too large: ${(file.size/(1024*1024)).toFixed(2)}MB exceeds the limit of ${DOCUMENT_CONFIG.maxDocumentSize/(1024*1024)}MB` 
          };
        }
        
        return null;
      }).filter(Boolean);
      
      if (invalidFiles.length > 0) {
        toast.error(`Cannot upload ${invalidFiles.length} file(s)`, {
          description: "Some files are not supported. Check file types and sizes.",
          duration: 5000
        });
        
        // Add to failed uploads for detailed user feedback
        setFailedUploads(
          invalidFiles.map((item: any) => ({
            filename: item.file.name,
            error: item.reason
          }))
        );
        
        // Upload only valid files
        const validFiles = files.filter(f => !invalidFiles.some((item: any) => item.file.name === f.name));
        if (validFiles.length === 0) return;
        
        console.log(`Adding ${validFiles.length} valid documents to project ${projectId}`);
        addDocuments(validFiles);
      } else {
        console.log(`Adding ${files.length} documents to project ${projectId}`);
        addDocuments(files);
      }
      
      // Force a refetch after adding documents to ensure persistence
      setTimeout(() => {
        refetchDocuments();
      }, 1000);
    } catch (err) {
      console.error("Error handling file selection:", err);
      
      // Better error handling
      errorService.handleError(err, {
        context: "document-upload-failed",
        projectId,
        fileCount: files.length
      });
      
      setFailedUploads(
        files.map(file => ({
          filename: file.name,
          error: err instanceof Error ? err.message : "Unknown error uploading file"
        }))
      );
      
      toast.error("Document upload failed", {
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        duration: 5000
      });
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
  
  // Improved function to get only real documents consistently across the app
  const getDisplayDocuments = useCallback((): Document[] => {
    if (!documents || documents.length === 0) return [];
    
    // Logic is now consistent with DocumentsSection
    const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
    
    // Only show mock documents if no real ones exist
    return realDocs.length > 0 ? realDocs : documents;
  }, [documents]);
  
  // Get exact document counts for UI
  const getDocumentCounts = useCallback(() => {
    if (!documents) return { total: 0, real: 0, mock: 0 };
    
    const mockDocs = documents.filter(doc => doc.id.startsWith('mock_'));
    const realDocs = documents.filter(doc => !doc.id.startsWith('mock_'));
    
    return {
      total: documents.length,
      real: realDocs.length,
      mock: mockDocs.length
    };
  }, [documents]);
  
  // Public API
  return {
    documents: getDisplayDocuments(),
    documentCounts: getDocumentCounts(),
    isLoading,
    error: error ? String(error) : null,
    failedUploads,
    hasRealDocuments,
    handleFilesSelected,
    handleRemoveDocument,
    // Expose these for components that need direct access
    refetchDocuments,
    getDisplayDocuments
  };
};
