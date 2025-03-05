
import React from "react";
import { FileUpload } from "@/components/file-upload";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentUploadSectionProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  onFilesSelected,
  isLoading = false,
}) => {
  return (
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
  );
};

export default DocumentUploadSection;
