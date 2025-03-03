
import React from "react";
import { Document, Project, AIProcessingStatus } from "@/lib/types";
import { FileUpload } from "@/components/file-upload";
import DocumentList from "@/components/project/DocumentList";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface DocumentsTabContentProps {
  documents: Document[];
  project: Project;
  aiStatus: AIProcessingStatus;
  onFilesSelected: (files: File[]) => void;
  onRemoveDocument: (documentId: string) => void;
  onAnalyzeDocuments: () => void;
}

const DocumentsTabContent: React.FC<DocumentsTabContentProps> = ({
  documents,
  project,
  aiStatus,
  onFilesSelected,
  onRemoveDocument,
  onAnalyzeDocuments,
}) => {
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
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Documents</h2>
          <Button 
            onClick={onAnalyzeDocuments} 
            disabled={documents.length === 0 || aiStatus.status === 'processing'}
            className="flex items-center gap-2"
          >
            <Brain size={16} />
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
              thickness="thick" 
              indicatorColor="bg-blue-500" 
              showAnimation={true} 
              className="mb-2" 
            />
            <p className="text-xs text-slate-500 italic">
              Our AI is thoroughly analyzing all of your documents to extract strategic gaming opportunities...
            </p>
          </div>
        )}
        
        {documents.length > 0 && (
          <div className="mb-4 text-sm">
            <p className="text-slate-600">
              <span className="font-semibold">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} uploaded. 
              All documents will be analyzed in detail when you click "Analyze with AI".
            </p>
          </div>
        )}
        
        <DocumentList 
          documents={documents}
          onRemoveDocument={onRemoveDocument}
        />
      </div>
    </div>
  );
};

export default DocumentsTabContent;
