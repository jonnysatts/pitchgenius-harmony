import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/lib/types';
import { toast } from 'sonner';
import { documentService } from '../../services/documents/documentService';
import { errorService } from '../../services/error/errorService';
import { DOCUMENT_CONFIG } from '../../services/api/config';

const DOCUMENTS_QUERY_KEY = 'project-documents';

/**
 * React Query hook for document management with better project filtering
 * and storage consistency
 */
export const useQueryDocuments = (projectId: string) => {
  const queryClient = useQueryClient();

  // Generate a consistent query key that includes the projectId
  const getQueryKey = () => [DOCUMENTS_QUERY_KEY, projectId];

  // Fetch documents using the documentService
  const {
    data: documents = [],
    isLoading,
    error,
    refetch
  } = useQuery<Document[]>({
    queryKey: getQueryKey(),
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        console.log(`Fetching documents for project: ${projectId}`);
        return await documentService.fetchProjectDocuments(projectId);
      } catch (err) {
        errorService.handleError(err, {
          context: 'document-fetch',
          projectId
        });
        return [];
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true
  });

  // Add document mutation
  const { mutateAsync: addDocumentsMutation } = useMutation({
    mutationFn: async (files: File[]) => {
      if (!projectId) {
        throw new Error('No project ID provided for document upload');
      }

      const currentDocs = queryClient.getQueryData<Document[]>(getQueryKey()) || [];
      
      // Check if we'd exceed the maximum number of documents per project
      if (currentDocs.length + files.length > DOCUMENT_CONFIG.maxDocumentsPerProject) {
        throw new Error(
          `Too many documents. Maximum ${DOCUMENT_CONFIG.maxDocumentsPerProject} documents allowed per project.`
        );
      }

      // Track upload progress
      const uploadedDocs: Document[] = [];
      const failedUploads: { file: File; error: string }[] = [];

      // Upload each file and collect the results
      for (const file of files) {
        try {
          // Validate file size
          if (file.size > DOCUMENT_CONFIG.maxDocumentSize) {
            throw new Error(
              `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds limit of ${
                DOCUMENT_CONFIG.maxDocumentSize / (1024 * 1024)
              }MB`
            );
          }

          // Validate file type
          if (!DOCUMENT_CONFIG.allowedDocumentTypes.includes(file.type)) {
            throw new Error(`Unsupported file type: ${file.type}`);
          }

          const uploadedDoc = await documentService.uploadDocument(projectId, file);
          if (uploadedDoc) {
            uploadedDocs.push(uploadedDoc);
          }
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err);
          failedUploads.push({
            file,
            error: err instanceof Error ? err.message : 'Unknown error'
          });

          errorService.handleError(err, {
            context: 'document-upload',
            projectId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
        }
      }

      // Show success/failure toasts
      if (uploadedDocs.length > 0) {
        toast.success(
          `${uploadedDocs.length} ${uploadedDocs.length === 1 ? 'document' : 'documents'} uploaded`,
          {
            description: 'Your documents are ready for analysis',
            duration: 4000
          }
        );
      }

      if (failedUploads.length > 0) {
        toast.error(
          `${failedUploads.length} ${failedUploads.length === 1 ? 'document' : 'documents'} failed to upload`,
          {
            description: failedUploads.map(f => `${f.file.name}: ${f.error}`).join(', '),
            duration: 6000
          }
        );
      }

      return uploadedDocs;
    },
    onSuccess: (newDocs) => {
      // Update the cache with the newly added documents
      queryClient.setQueryData<Document[]>(getQueryKey(), (oldDocs = []) => {
        // Ensure we don't duplicate documents by checking IDs
        const existingIds = new Set(oldDocs.map(doc => doc.id));
        const uniqueNewDocs = newDocs.filter(doc => !existingIds.has(doc.id));
        
        return [...oldDocs, ...uniqueNewDocs];
      });
    }
  });

  // Remove document mutation
  const { mutateAsync: removeDocumentMutation } = useMutation({
    mutationFn: async (documentId: string) => {
      if (!documentId) {
        throw new Error('No document ID provided for removal');
      }

      const success = await documentService.removeDocument(documentId);
      
      if (!success) {
        throw new Error(`Failed to remove document ${documentId}`);
      }
      
      return documentId;
    },
    onSuccess: (removedDocId) => {
      // Update the cache to remove the deleted document
      queryClient.setQueryData<Document[]>(getQueryKey(), (oldDocs = []) => {
        return oldDocs.filter(doc => doc.id !== removedDocId);
      });
      
      toast.success('Document removed', {
        description: 'The document has been successfully removed',
        duration: 3000
      });
    },
    onError: (error) => {
      errorService.handleError(error, {
        context: 'document-delete'
      });
    }
  });

  // Add multiple documents at once
  const addDocuments = async (files: File[]) => {
    try {
      return await addDocumentsMutation(files);
    } catch (error) {
      console.error('Error adding documents:', error);
      throw error;
    }
  };

  // Remove a document
  const removeDocument = async (documentId: string) => {
    try {
      return await removeDocumentMutation(documentId);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  };

  // Refetch documents
  const refetchDocuments = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refetching documents:', error);
    }
  };

  return {
    documents: documents || [],
    isLoading,
    error,
    addDocuments,
    removeDocument,
    refetchDocuments
  };
};
