
import React, { useState } from "react";
import { Document, AIProcessingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, AlertCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DocumentList from "@/components/project/DocumentList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentsSectionProps {
  documents: Document[];
  isLoading?: boolean;
  error?: string | null;
  aiStatus?: AIProcessingStatus;
  onRemoveDocument: (documentId: string) => void;
  onAnalyzeDocuments: () => void;
  analysisStarted: boolean;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  isLoading = false,
  error,
  aiStatus,
  onRemoveDocument,
  onAnalyzeDocuments,
  analysisStarted,
}) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  
  // Filter out any mock documents if real documents exist
  const realDocuments = documents.filter(doc => !doc.id.startsWith('mock_') || documents.length === 3);
  const hasRealDocuments = realDocuments.length > 0;
  const displayedDocuments = hasRealDocuments ? realDocuments : documents;
  
  const analyzeButtonDisabled = displayedDocuments.length === 0 || 
                              (aiStatus && aiStatus.status === 'processing') || 
                              isLoading ||
                              isButtonClicked;
  
  const isClaudeProcessing = aiStatus && 
                            aiStatus.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  const handleAnalyzeClick = () => {
    if (!analyzeButtonDisabled) {
      console.log("Analyze button clicked, triggering document analysis");
      setIsButtonClicked(true);
      
      onAnalyzeDocuments();
      
      setTimeout(() => {
        setIsButtonClicked(false);
      }, 2000);
    } else {
      console.log("Analyze button is disabled, ignoring click");
    }
  };
  
  return (
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
      
      {analysisStarted && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Analysis in Progress</AlertTitle>
          <AlertDescription className="text-blue-600">
            We're now analyzing your documents. You will be redirected to the insights tab to view the progress.
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <span className="ml-3 text-slate-600">Loading documents...</span>
        </div>
      )}
      
      {!isLoading && displayedDocuments.length > 0 && (
        <div className="mb-4 text-sm">
          <p className="text-slate-600">
            <span className="font-semibold">{displayedDocuments.length}</span> document{displayedDocuments.length !== 1 ? 's' : ''} uploaded. 
            All documents will be analyzed in detail when you click "Analyze with AI".
          </p>
        </div>
      )}
      
      {!isLoading && displayedDocuments.length === 0 && (
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
          documents={displayedDocuments}
          onRemoveDocument={onRemoveDocument}
        />
      )}
    </div>
  );
};

export default DocumentsSection;
