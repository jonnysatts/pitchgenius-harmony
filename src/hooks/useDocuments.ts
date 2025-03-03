
import { useState } from "react";
import { Document } from "@/lib/types";
import { processFiles } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";

export const useDocuments = (projectId: string, userId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (!userId) return;
    
    const newDocuments = processFiles(files, projectId, userId);
    setDocuments(prev => [...prev, ...newDocuments]);
    
    toast({
      title: "Documents uploaded",
      description: `Successfully uploaded ${files.length} document${files.length !== 1 ? 's' : ''}`,
    });
  };
  
  const handleRemoveDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    toast({
      title: "Document removed",
      description: "Document has been removed from the project",
    });
  };

  return {
    documents,
    handleFilesSelected,
    handleRemoveDocument
  };
};
