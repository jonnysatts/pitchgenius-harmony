
import React, { useState, useEffect } from "react";
import { Document, Project, AIProcessingStatus } from "@/lib/types";
import { toast } from 'sonner';
import WebsiteAnalysisCard from "@/components/project/WebsiteAnalysisCard";
import { DocumentUploadSection, DocumentsSection } from "./documents";

interface DocumentsTabContentProps {
  documents: Document[];
  project?: Project;
  aiStatus?: AIProcessingStatus;
  isLoading?: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveDocument: (documentId: string) => void;
  onAnalyzeDocuments: () => void;
  onAnalyzeWebsite?: () => void;
  isAnalyzingWebsite?: boolean;
  hasDocuments?: boolean;
  websiteUrl?: string;
  error?: string | null;
}

const DocumentsTabContent: React.FC<DocumentsTabContentProps> = ({
  documents,
  project,
  aiStatus,
  isLoading = false,
  onFilesSelected,
  onRemoveDocument,
  onAnalyzeDocuments,
  onAnalyzeWebsite,
  isAnalyzingWebsite = false,
  websiteUrl,
  error
}) => {
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  useEffect(() => {
    setAnalysisStarted(false);
  }, []);
  
  const handleAnalyzeDocuments = () => {
    console.log("Analyze button clicked, triggering document analysis");
    setAnalysisStarted(true);
    
    toast.info("Analysis started", {
      description: "Switching to insights tab to show analysis progress"
    });
    
    onAnalyzeDocuments();
  };
  
  return (
    <div className="space-y-6">
      <DocumentUploadSection 
        onFilesSelected={onFilesSelected}
        isLoading={isLoading}
      />
      
      {(websiteUrl || project?.clientWebsite) && onAnalyzeWebsite && (
        <WebsiteAnalysisCard
          websiteUrl={websiteUrl || project?.clientWebsite}
          isAnalyzing={isAnalyzingWebsite}
          onAnalyzeWebsite={onAnalyzeWebsite}
        />
      )}
      
      <DocumentsSection
        documents={documents}
        isLoading={isLoading}
        error={error}
        aiStatus={aiStatus}
        onRemoveDocument={onRemoveDocument}
        onAnalyzeDocuments={handleAnalyzeDocuments}
        analysisStarted={analysisStarted}
      />
    </div>
  );
};

export default DocumentsTabContent;
