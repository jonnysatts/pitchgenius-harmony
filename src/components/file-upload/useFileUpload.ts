
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxFileSizeMB: number;
  maxFiles: number;
  disabled?: boolean;
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
  const { toast } = useToast();
  
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
    
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes('*')) {
      return `File type not accepted. Accepted types: ${acceptedFileTypes.join(', ')}`;
    }
    
    return null;
  };
  
  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 300);
  };
  
  const processFiles = (filesToProcess: FileList | File[]) => {
    if (disabled) return;
    
    const newFiles: File[] = [];
    const errors: Record<string, string> = {};
    const progress: Record<string, number> = {};
    
    // Convert FileList to array
    const filesArray = Array.from(filesToProcess);
    
    // Check if adding these files would exceed max files
    if (selectedFiles.length + filesArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }
    
    filesArray.forEach(file => {
      const error = validateFile(file);
      
      if (error) {
        errors[file.name] = error;
      } else {
        newFiles.push(file);
        progress[file.name] = 0;
        
        // Simulate upload progress
        simulateUploadProgress(file.name);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFileErrors(prev => ({ ...prev, ...errors }));
    }
    
    if (newFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      setUploadProgress(prev => ({ ...prev, ...progress }));
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
    
    // Also remove from errors and progress if present
    const newErrors = { ...fileErrors };
    delete newErrors[fileName];
    setFileErrors(newErrors);
    
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
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
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    dismissError
  };
};
