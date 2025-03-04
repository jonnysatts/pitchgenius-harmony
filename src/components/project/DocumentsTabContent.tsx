
import React, { useState } from "react";
import { Document, Project, AIProcessingStatus } from "@/lib/types";
import { FileUpload } from "@/components/file-upload";
import DocumentList from "@/components/project/DocumentList";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, AlertCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import WebsiteAnalysisCard from "@/components/project/WebsiteAnalysisCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  hasDocuments,
  websiteUrl,
  error
}) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  
  // Only disable the Analyze button if:
  // 1. There are no documents OR
  // 2. AI processing is currently happening OR
  // 3. Documents are currently being loaded/uploaded OR
  // 4. The button was just clicked (to prevent double clicks)
  const analyzeButtonDisabled = documents.length === 0 || 
                               (aiStatus && aiStatus.status === 'processing') || 
                               isLoading ||
                               isButtonClicked;
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus && 
                            aiStatus.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  // Handle the analyze button click with visual feedback
  const handleAnalyzeClick = () => {
    if (!analyzeButtonDisabled) {
      console.log("Analyze button clicked, triggering document analysis");
      setIsButtonClicked(true);
      
      // Call the analyze function
      onAnalyzeDocuments();
      
      // Reset button state after a delay (for better UX)
      setTimeout(() => {
        setIsButtonClicked(false);
      }, 2000);
    } else {
      console.log("Analyze button is disabled, ignoring click");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
        <p className="text-slate-500 mb-4">
          Upload your client documents. We support PDFs, Office documents, images, and text files.
          All documents will be thoroughly analyzed by our AI.
        </p>
        
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Troubleshooting Tips</AlertTitle>
          <AlertDescription className="text-blue-600">
            If you encounter upload errors with large files, try splitting them into smaller documents or compressing PDFs.
            In development mode, uploads will continue to work even if storage errors occur.
          </AlertDescription>
        </Alert>
        
        <FileUpload 
          onFilesSelected={onFilesSelected}
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.md', '.jpg', '.png']}
          maxFileSizeMB={25}
          maxFiles={20}
          disabled={isLoading}
        />
      </div>
      
      {/* Website Analysis Card - only shown if needed */}
      {(websiteUrl || project?.clientWebsite) && onAnalyzeWebsite && (
        <WebsiteAnalysisCard
          websiteUrl={websiteUrl || project?.clientWebsite}
          isAnalyzing={isAnalyzingWebsite}
          onAnalyzeWebsite={onAnalyzeWebsite}
        />
      )}
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Documents</h2>
          <Button 
            onClick={handleAnalyzeClick}
            disabled={analyzeButtonDisabled}
            className={`flex items-center gap-2 ${isButtonClicked ? 'bg-brand-blue/80' : ''}`}
            aria-label="Analyze documents with AI"
          >
            {(aiStatus && aiStatus.status === 'processing') || isButtonClicked ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain size={16} />
            )}
            {aiStatus && aiStatus.status === 'processing' ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        </div>
        
        {aiStatus && aiStatus.status === 'processing' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{aiStatus.message}</span>
              <span>{aiStatus.progress}%</span>
            </div>
            <Progress 
              value={aiStatus.progress} 
              className="mb-2"
              showAnimation={isClaudeProcessing}
              indicatorColor={isClaudeProcessing ? "bg-blue-500" : undefined}
            />
            <p className={`text-xs italic ${isClaudeProcessing ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
              {isClaudeProcessing 
                ? "Claude AI is processing your documents. This may take up to 2 minutes for complex analyses..." 
                : "Our AI is thoroughly analyzing all of your documents to extract strategic gaming opportunities..."}
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
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
