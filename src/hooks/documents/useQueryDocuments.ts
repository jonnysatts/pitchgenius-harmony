
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document } from "@/lib/types";
import { fetchProjectDocuments } from "@/services/documents";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/error/useErrorHandler";

/**
 * Hook for managing document state with React Query
 */
export const useQueryDocuments = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  // Query key for this project's documents
  const documentsQueryKey = ['project', projectId, 'documents'];

  // Fetch documents from API/storage
  const documentsQuery = useQuery({
    queryKey: documentsQueryKey,
    queryFn: async () => {
      try {
        if (!projectId) return [];
        return await fetchProjectDocuments(projectId);
      } catch (err) {
        // Transform error using error handler but still throw for React Query
        const errorDetails = handleError(err, { 
          context: 'fetching-documents', 
          projectId 
        });
        
        throw new Error(errorDetails.message);
      }
    },
    enabled: !!projectId, // Only run if we have a projectId
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add documents mutation
  const addDocumentsMutation = useMutation({
    mutationFn: async (files: File[]): Promise<Document[]> => {
      // This would normally call an API
      // For now, it'll create mock documents
      const newDocuments: Document[] = files.map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file),
        projectId,
        status: 'uploaded',
        content: null // Would be populated after processing
      }));
      
      // Get current documents
      const currentDocs = queryClient.getQueryData<Document[]>(documentsQueryKey) || [];
      
      // Return the combined list
      return [...currentDocs, ...newDocuments];
    },
    onSuccess: (newDocumentsList) => {
      // Update query cache
      queryClient.setQueryData(documentsQueryKey, newDocumentsList);
      
      // Show success toast
      toast({
        title: "Documents uploaded",
        description: "Your documents were successfully uploaded",
        variant: "default",
      });
    },
    onError: (error) => {
      handleError(error, { context: 'uploading-documents', projectId });
      
      toast({
        title: "Error uploading documents",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Remove document mutation
  const removeDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // Get current documents
      const currentDocs = queryClient.getQueryData<Document[]>(documentsQueryKey) || [];
      
      // Filter out the removed document
      return currentDocs.filter(doc => doc.id !== documentId);
    },
    onSuccess: (newDocumentsList) => {
      // Update query cache
      queryClient.setQueryData(documentsQueryKey, newDocumentsList);
      
      // Show success toast
      toast({
        title: "Document removed",
        description: "The document was successfully removed",
        variant: "default",
      });
    },
    onError: (error) => {
      handleError(error, { context: 'removing-document', projectId });
      
      toast({
        title: "Error removing document",
        description: "Failed to remove the document. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    // Query results
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isFetching: documentsQuery.isFetching,
    error: documentsQuery.error,
    
    // Mutations
    addDocuments: (files: File[]) => addDocumentsMutation.mutate(files),
    removeDocument: (documentId: string) => removeDocumentMutation.mutate(documentId),
    
    // Mutation states
    isAddingDocuments: addDocumentsMutation.isPending,
    isRemovingDocument: removeDocumentMutation.isPending,
    
    // Refetch
    refetchDocuments: documentsQuery.refetch
  };
};
