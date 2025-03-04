
import React from "react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "./useFileUpload";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.md', '.jpg', '.png'],
  maxFileSizeMB = 25, // Increased from 10MB to 25MB
  maxFiles = 20, // Increased from 10 to 20
  className,
  disabled = false
}) => {
  const {
    dragActive,
    selectedFiles,
    uploadProgress,
    fileErrors,
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    dismissError
  } = useFileUpload({
    onFilesSelected,
    acceptedFileTypes,
    maxFileSizeMB,
    maxFiles,
    disabled
  });
  
  return (
    <div className={cn("w-full", className, disabled ? "opacity-70 pointer-events-none" : "")}>
      <DropZone
        dragActive={dragActive}
        acceptedFileTypes={acceptedFileTypes}
        maxFileSizeMB={maxFileSizeMB}
        maxFiles={maxFiles}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onFileInputChange={handleChange}
        disabled={disabled}
      />
      
      <FileList
        selectedFiles={selectedFiles}
        uploadProgress={uploadProgress}
        fileErrors={fileErrors}
        onRemoveFile={removeFile}
        onDismissError={dismissError}
      />
    </div>
  );
};

export default FileUpload;
