
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/lib/types';
import { apiClient } from '@/services/api/apiClient';
import { useToast } from '@/hooks/use-toast';

/**
 * React Query hook for document management
 */
export const useQueryDocuments = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query to fetch documents
  const {
    data: documents = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => apiClient.documents.fetchProjectDocuments(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  });
  
  // Mutation to upload a document
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, priority }: { file: File, priority?: number }) => 
      apiClient.documents.uploadDocument(projectId, file, priority),
    onSuccess: () => {
      // Invalidate the documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({
        title: "Document Uploaded",
        description: "Document has been successfully uploaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to remove a document
  const removeDocumentMutation = useMutation({
    mutationFn: (documentId: string) => apiClient.documents.removeDocument(documentId),
    onSuccess: () => {
      // Invalidate the documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({
        title: "Document Removed",
        description: "Document has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: `Failed to remove document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  return {
    documents,
    isLoading,
    error,
    refetch,
    uploadDocument: uploadDocumentMutation.mutate,
    removeDocument: removeDocumentMutation.mutate,
    isUploading: uploadDocumentMutation.isPending,
    isRemoving: removeDocumentMutation.isPending
  };
};
