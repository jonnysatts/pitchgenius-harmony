
import React from "react";
import { FileItem } from "./FileItem";
import { FileError } from "./FileError";

interface FileListProps {
  selectedFiles: File[];
  uploadProgress: Record<string, number>;
  fileErrors: Record<string, string>;
  onRemoveFile: (fileName: string) => void;
  onDismissError: (fileName: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  selectedFiles,
  uploadProgress,
  fileErrors,
  onRemoveFile,
  onDismissError
}) => {
  if (selectedFiles.length === 0 && Object.keys(fileErrors).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-slate-700">
        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
      </p>
      
      <div className="space-y-2">
        {selectedFiles.map(file => (
          <FileItem 
            key={file.name}
            file={file}
            progress={uploadProgress[file.name] || 0}
            onRemove={onRemoveFile}
          />
        ))}
        
        {/* Display file errors */}
        {Object.entries(fileErrors).map(([fileName, error]) => (
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
