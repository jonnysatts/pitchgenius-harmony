
import React from "react";
import { Document, Project, AIProcessingStatus } from "@/lib/types";
import { FileUpload } from "@/components/file-upload";
import DocumentList from "@/components/project/DocumentList";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, AlertCircle, Globe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  websiteUrl?: string; // Added the missing websiteUrl property
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
}) => {
  // Only disable the Analyze button if:
  // 1. There are no documents OR
  // 2. AI processing is currently happening OR
  // 3. Documents are currently being loaded/uploaded
  const analyzeButtonDisabled = documents.length === 0 || 
                               (aiStatus && aiStatus.status === 'processing') || 
                               isLoading;
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus && 
                            aiStatus.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  // Can analyze website if:
  // 1. Website URL exists
  // 2. Not currently analyzing website
  // 3. Not in the middle of document analysis
  const canAnalyzeWebsite = 
    !!project?.clientWebsite && 
    !isAnalyzingWebsite && 
    !(aiStatus && aiStatus.status === 'processing');
  
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
      
      {/* Website Analysis Card */}
      {project?.clientWebsite && onAnalyzeWebsite && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Website Analysis</CardTitle>
                <CardDescription>Generate preliminary insights based on the client's website</CardDescription>
              </div>
              
              <Button 
                onClick={onAnalyzeWebsite}
                disabled={!canAnalyzeWebsite}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isAnalyzingWebsite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe size={16} />}
                {isAnalyzingWebsite ? 'Analyzing...' : 'Analyze Website'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-slate-600 flex items-center">
              <Globe size={14} className="mr-2 text-slate-400" />
              <span className="font-medium text-slate-700 mr-1">Website URL:</span> 
              <a 
                href={project.clientWebsite.startsWith('http') ? project.clientWebsite : `https://${project.clientWebsite}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {project.clientWebsite}
              </a>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              This will analyze the client's website to extract brand positioning, target audience, and potential gaming opportunities.
              Website-derived insights will be marked as preliminary research.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Documents</h2>
          <Button 
            onClick={onAnalyzeDocuments}
            disabled={analyzeButtonDisabled}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain size={16} />}
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
