
import React, { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileUp, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  maxFiles?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.md', '.jpg', '.png'],
  maxFileSizeMB = 10,
  maxFiles = 10,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Calculate max file size in bytes
  const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
  
  const handleDrag = (e: React.DragEvent) => {
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
  
  const processFiles = (filesToProcess: FileList | File[]) => {
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
      onFilesSelected(updatedFiles);
    }
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
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    
    // Also remove from errors and progress if present
    const newErrors = { ...fileErrors };
    delete newErrors[fileName];
    setFileErrors(newErrors);
    
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center",
          dragActive ? "border-brand-orange bg-orange-50" : "border-slate-300 hover:border-slate-400",
          "group"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={acceptedFileTypes.join(',')}
          className="hidden"
        />
        
        <FileUp 
          size={36} 
          className={cn(
            "mb-4 transition-colors",
            dragActive ? "text-brand-orange" : "text-slate-400 group-hover:text-slate-500"
          )} 
        />
        
        <p className="mb-2 font-medium text-slate-700">
          {dragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        
        <p className="mb-4 text-sm text-slate-500">
          or
        </p>
        
        <Button 
          type="button"
          onClick={handleButtonClick}
          variant="outline"
        >
          Browse files
        </Button>
        
        <p className="mt-3 text-xs text-slate-500">
          Accepted file types: {acceptedFileTypes.join(', ')}
        </p>
        <p className="text-xs text-slate-500">
          Maximum file size: {maxFileSizeMB}MB (up to {maxFiles} files)
        </p>
      </div>
      
      {/* Display selected files */}
      {(selectedFiles.length > 0 || Object.keys(fileErrors).length > 0) && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
          
          <div className="space-y-2">
            {selectedFiles.map(file => (
              <div 
                key={file.name}
                className="flex items-center p-3 border rounded-lg bg-white"
              >
                <File size={20} className="text-slate-400 mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="mt-1">
                    <Progress 
                      value={uploadProgress[file.name] || 0} 
                      className="h-1"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500">
                      {uploadProgress[file.name] === 100 ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 size={12} className="mr-1" /> Complete
                        </span>
                      ) : (
                        `${uploadProgress[file.name] || 0}%`
                      )}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full hover:bg-slate-100"
                      onClick={() => removeFile(file.name)}
                    >
                      <X size={14} className="text-slate-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Display file errors */}
            {Object.entries(fileErrors).map(([fileName, error]) => (
              <div 
                key={fileName}
                className="flex items-center p-3 border border-red-200 rounded-lg bg-red-50"
              >
                <AlertCircle size={20} className="text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 truncate max-w-xs">
                    {fileName}
                  </p>
                  <p className="text-xs text-red-600">
                    {error}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-red-100"
                  onClick={() => {
                    const newErrors = { ...fileErrors };
                    delete newErrors[fileName];
                    setFileErrors(newErrors);
                  }}
                >
                  <X size={14} className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
