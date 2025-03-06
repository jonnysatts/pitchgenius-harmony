import React from "react";
import { FileItem } from "./FileItem";
import { FileError } from "./FileError";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileListProps {
  selectedFiles: File[];
  uploadProgress: Record<string, number>;
  fileErrors: Record<string, string>;
  fileStatuses?: Record<string, 'uploading' | 'complete' | 'error' | 'processing'>;
  onRemoveFile: (fileName: string) => void;
  onDismissError: (fileName: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  selectedFiles,
  uploadProgress,
  fileErrors,
  fileStatuses = {},
  onRemoveFile,
  onDismissError
}) => {
  if (selectedFiles.length === 0 && Object.keys(fileErrors).length === 0) {
    return null;
  }

  const errorCount = Object.keys(fileErrors).length;
  const hasErrors = errorCount > 0;

  // Count files by status
  const statusCounts = {
    uploading: 0,
    complete: 0,
    error: 0,
    processing: 0
  };

  selectedFiles.forEach(file => {
    const status = fileStatuses[file.name] || 
      (uploadProgress[file.name] === 100 ? 'complete' : 'uploading');
    statusCounts[status]++;
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-slate-700">
          {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
        </p>
        
        {/* Status summary */}
        <div className="flex space-x-3">
          {statusCounts.uploading > 0 && (
            <span className="text-xs text-slate-500">
              {statusCounts.uploading} uploading
            </span>
          )}
          {statusCounts.processing > 0 && (
            <span className="text-xs text-amber-500">
              {statusCounts.processing} processing
            </span>
          )}
          {statusCounts.complete > 0 && (
            <span className="text-xs text-green-600">
              {statusCounts.complete} complete
            </span>
          )}
          {statusCounts.error > 0 && (
            <span className="text-xs text-red-600">
              {statusCounts.error} failed
            </span>
          )}
        </div>
      </div>
      
      {/* Error summary, if any */}
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm">
            {errorCount === 1 
              ? "1 file couldn't be uploaded. See details below." 
              : `${errorCount} files couldn't be uploaded. See details below.`}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3">
        {/* Display uploaded files with status */}
        {selectedFiles.map(file => (
          <FileItem 
            key={file.name}
            file={file}
            progress={uploadProgress[file.name] || 0}
            status={fileStatuses[file.name]}
            error={fileErrors[file.name]}
            onRemove={onRemoveFile}
          />
        ))}
        
        {/* Display file errors for files that weren't added to the selected files */}
        {Object.entries(fileErrors)
          .filter(([fileName]) => !selectedFiles.some(file => file.name === fileName))
          .map(([fileName, error]) => (
            <FileError 
              key={fileName}
              fileName={fileName}
              errorMessage={error}
              onDismiss={onDismissError}
            />
          ))}
      </div>
    </div>
  );
};
