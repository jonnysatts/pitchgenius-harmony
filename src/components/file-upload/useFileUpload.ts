import { useState } from "react";
import { toast } from "sonner";
import { errorService } from "@/services/error/errorService";
import { DOCUMENT_CONFIG } from "@/services/api/config";

interface UseFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxFileSizeMB: number;
  maxFiles: number;
  disabled?: boolean;
}

export interface FileError {
  message: string;
  details?: string;
  retriable: boolean;
}

export const useFileUpload = ({
  onFilesSelected,
  acceptedFileTypes,
  maxFileSizeMB,
  maxFiles,
  disabled = false
}: UseFileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'uploading' | 'complete' | 'error' | 'processing'>>({});
  
  // Calculate max file size in bytes
  const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
  
  const handleDrag = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File exceeds maximum size of ${maxFileSizeMB}MB`;
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return "File is empty";
    }
    
    // Improved file type checking
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = `.${fileName.split('.').pop()}`;
    
    // Check if file is a PDF
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF is explicitly allowed if in accepted types
      if (acceptedFileTypes.includes('.pdf') || acceptedFileTypes.includes('*')) {
        return null;
      }
    }
    
    // Check if extension is in accepted types
    if (acceptedFileTypes.includes('*') || 
        acceptedFileTypes.includes(fileExtension) || 
        acceptedFileTypes.some(type => type.includes(fileExtension))) {
      return null;
    }
    
    // Check if MIME type is in accepted types
    if (acceptedFileTypes.some(type => fileType.includes(type.replace('.', '')))) {
      return null;
    }
    
    return `Unsupported file type. Accepted types: ${acceptedFileTypes.join(', ')}`;
  };
  
  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    setFileStatuses(prev => ({ ...prev, [fileName]: 'uploading' }));
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // After reaching 100%, set to processing for a moment
        setFileStatuses(prev => ({ ...prev, [fileName]: 'processing' }));
        
        // Then set to complete after a short delay
        setTimeout(() => {
          setFileStatuses(prev => ({ ...prev, [fileName]: 'complete' }));
        }, 1500);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 300);
    
    // Return a function to cancel the interval if needed
    return () => clearInterval(interval);
  };
  
  const processFiles = (filesToProcess: FileList | File[]) => {
    if (disabled) return;
    
    const newFiles: File[] = [];
    const errors: Record<string, string> = {};
    const progress: Record<string, number> = {};
    const statuses: Record<string, 'uploading' | 'complete' | 'error' | 'processing'> = {};
    
    // Convert FileList to array
    const filesArray = Array.from(filesToProcess);
    
    // Check if adding these files would exceed max files in this batch
    if (filesArray.length > maxFiles) {
      const error = `Too many files. You can upload a maximum of ${maxFiles} files at once.`;
      
      errorService.handleError(error, {
        context: 'document-upload',
        maxFiles
      });
      
      return;
    }
    
    // We don't check against total documents here - that's handled in useDocuments.ts
    
    filesArray.forEach(file => {
      // Check for duplicate filenames
      const isDuplicate = selectedFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (isDuplicate) {
        errors[file.name] = `File "${file.name}" has already been added`;
        return;
      }
      
      const error = validateFile(file);
      
      if (error) {
        errors[file.name] = error;
        statuses[file.name] = 'error';
        
        errorService.handleError(error, {
          context: 'document-upload',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
      } else {
        newFiles.push(file);
        progress[file.name] = 0;
        statuses[file.name] = 'uploading';
        
        // Simulate upload progress
        simulateUploadProgress(file.name);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFileErrors(prev => ({ ...prev, ...errors }));
      setFileStatuses(prev => ({ ...prev, ...statuses }));
    }
    
    if (newFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      setUploadProgress(prev => ({ ...prev, ...progress }));
      setFileStatuses(prev => ({ ...prev, ...statuses }));
      
      // Success message for files added to upload queue
      if (newFiles.length === 1) {
        toast.success(`File added to upload queue`, {
          description: newFiles[0].name,
          duration: 3000
        });
      } else {
        toast.success(`${newFiles.length} files added to upload queue`, {
          description: `Ready to process ${newFiles.length} files`,
          duration: 3000
        });
      }
      
      onFilesSelected(newFiles);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const removeFile = (fileName: string) => {
    if (disabled) return;
    
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    
    // Also remove from errors, progress, and statuses if present
    const newErrors = { ...fileErrors };
    delete newErrors[fileName];
    setFileErrors(newErrors);
    
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
    
    const newStatuses = { ...fileStatuses };
    delete newStatuses[fileName];
    setFileStatuses(newStatuses);
  };

  const dismissError = (fileName: string) => {
    if (disabled) return;
    
    const newErrors = { ...fileErrors };
    delete newErrors[fileName];
    setFileErrors(newErrors);
  };
  
  return {
    dragActive,
    selectedFiles,
    uploadProgress,
    fileErrors,
    fileStatuses,
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    dismissError
  };
};
