import React, { useState } from "react";
import { FileText, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DocumentUploadSection from "./DocumentUploadSection";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { Document } from "@/lib/types";
import { toast } from "sonner";
import { errorService } from "@/services/error/errorService";

interface DocumentsSectionProps {
  projectId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ projectId }) => {
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    documents,
    addDocuments,
    removeDocument,
    analyzeDocuments,
    isLoading,
    error,
    getDocumentCounts
  } = useDocuments(projectId);
  
  // Get document counts for display
  const documentCounts = getDocumentCounts();
  const hasDocuments = documentCounts.total > 0;
  const hasRealDocuments = documentCounts.real > 0;
  const hasMockDocuments = documentCounts.mock > 0;
  
  // Display documents are either real documents (if we have any) or all documents (including mocks)
  const displayDocuments = hasRealDocuments 
    ? documents.filter(doc => !doc.id.startsWith('mock_')) 
    : documents;

  const handleFilesSelected = async (files: File[]) => {
    try {
      await addDocuments(files);
      setShowUploadSection(false);
    } catch (err) {
      errorService.handleError(err, {
        context: 'document-upload',
        projectId
      });
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await removeDocument(documentId);
    } catch (err) {
      errorService.handleError(err, {
        context: 'document-delete',
        documentId,
        projectId
      });
    }
  };

  const handleAnalyzeDocuments = async () => {
    if (!hasRealDocuments && !hasMockDocuments) {
      toast.error("No documents to analyze", {
        description: "Please upload at least one document before analyzing",
        duration: 5000
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await analyzeDocuments();
      toast.success("Analysis complete", {
        description: "Your documents have been analyzed successfully",
        duration: 5000
      });
    } catch (err) {
      errorService.handleError(err, {
        context: 'document-process',
        projectId,
        documentCount: documentCounts.total
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleUploadSection = () => {
    setShowUploadSection(!showUploadSection);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>There was an error loading your documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load documents. Please try refreshing the page."}
            </AlertDescription>
          </Alert>
          <Button onClick={handleToggleUploadSection}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Upload and analyze documents for your project
          </CardDescription>
          {hasRealDocuments && (
            <p className="text-sm text-slate-500 mt-1">
              <FileText className="inline-block mr-1" size={14} />
              {documentCounts.real} document{documentCounts.real !== 1 ? 's' : ''}
              {hasMockDocuments && 
                <span className="text-xs ml-2">
                  (+{documentCounts.mock} sample{documentCounts.mock !== 1 ? 's' : ''})
                </span>
              }
            </p>
          )}
          {!hasRealDocuments && hasMockDocuments && (
            <p className="text-sm text-slate-500 mt-1">
              <FileText className="inline-block mr-1" size={14} />
              {documentCounts.mock} sample document{documentCounts.mock !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleUploadSection}
            className="hidden sm:flex"
          >
            <Upload className="mr-1" size={14} />
            Upload
          </Button>
          <Button 
            size="sm" 
            onClick={handleAnalyzeDocuments}
            disabled={isAnalyzing || (!hasRealDocuments && !hasMockDocuments)}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Documents"
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasDocuments && !showUploadSection && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold">No documents</h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload documents to analyze for your project
            </p>
            <Button 
              onClick={handleToggleUploadSection}
              className="mt-4"
              variant="secondary"
              size="sm"
            >
              <Upload className="mr-1" size={14} />
              Upload Documents
            </Button>
          </div>
        )}
        
        {hasDocuments && !showUploadSection && (
          <div className="divide-y">
            {displayDocuments.map((document: Document) => (
              <div 
                key={document.id} 
                className={`py-3 flex justify-between items-center ${document.id.startsWith('mock_') ? 'text-slate-400' : ''}`}
              >
                <div className="flex items-center">
                  <FileText className="mr-2" size={16} />
                  <div>
                    <p className="text-sm font-medium leading-none">{document.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {document.id.startsWith('mock_') 
                        ? 'Sample document' 
                        : `Uploaded on ${new Date(document.uploadedAt).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                
                {!document.id.startsWith('mock_') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(document.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mobile upload button */}
        {!showUploadSection && hasDocuments && (
          <div className="mt-4 sm:hidden">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleToggleUploadSection}
            >
              <Upload className="mr-1" size={14} />
              Upload More Documents
            </Button>
          </div>
        )}
        
        {showUploadSection && (
          <div className="mt-4">
            <DocumentUploadSection 
              onFilesSelected={handleFilesSelected} 
              isLoading={isLoading}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={handleToggleUploadSection}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
