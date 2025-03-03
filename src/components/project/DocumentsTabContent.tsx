
import React from "react";
import { Document, Project, AIProcessingStatus } from "@/lib/types";
import { FileUpload } from "@/components/file-upload";
import DocumentList from "@/components/project/DocumentList";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface DocumentsTabContentProps {
  documents: Document[];
  project: Project;
  aiStatus: AIProcessingStatus;
  isLoading?: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveDocument: (documentId: string) => void;
  onAnalyzeDocuments: () => void;
}

const DocumentsTabContent: React.FC<DocumentsTabContentProps> = ({
  documents,
  project,
  aiStatus,
  isLoading = false,
  onFilesSelected,
  onRemoveDocument,
  onAnalyzeDocuments,
}) => {
  // Only disable the Analyze button if:
  // 1. There are no documents OR
  // 2. AI processing is currently happening OR
  // 3. Documents are currently being loaded/uploaded
  const analyzeButtonDisabled = documents.length === 0 || 
                               aiStatus.status === 'processing' || 
                               isLoading;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
        <p className="text-slate-500 mb-4">
          Upload your client documents. We support PDFs, Office documents, images, and text files.
          All documents will be thoroughly analyzed by our AI.
        </p>
        
        <FileUpload 
          onFilesSelected={onFilesSelected}
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.md', '.jpg', '.png']}
          maxFileSizeMB={25}
          maxFiles={20}
          disabled={isLoading}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Documents</h2>
          <Button 
            onClick={onAnalyzeDocuments}
            disabled={analyzeButtonDisabled}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain size={16} />}
            {aiStatus.status === 'processing' ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        </div>
        
        {aiStatus.status === 'processing' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{aiStatus.message}</span>
              <span>{aiStatus.progress}%</span>
            </div>
            <Progress 
              value={aiStatus.progress} 
              className="mb-2" 
            />
            <p className="text-xs text-slate-500 italic">
              Our AI is thoroughly analyzing all of your documents to extract strategic gaming opportunities...
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <span className="ml-3 text-slate-600">Loading documents...</span>
          </div>
        )}
        
        {!isLoading && documents.length > 0 && (
          <div className="mb-4 text-sm">
            <p className="text-slate-600">
              <span className="font-semibold">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} uploaded. 
              All documents will be analyzed in detail when you click "Analyze with AI".
            </p>
          </div>
        )}
        
        {!isLoading && documents.length === 0 && (
          <div className="flex items-center justify-center py-8 flex-col">
            <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-600 text-center">
              No documents have been uploaded yet. Please upload documents to analyze.
            </p>
          </div>
        )}
        
        {!isLoading && (
          <DocumentList 
            documents={documents}
            onRemoveDocument={onRemoveDocument}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsTabContent;
