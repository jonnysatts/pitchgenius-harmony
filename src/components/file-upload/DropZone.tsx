
import React, { useRef } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  dragActive: boolean;
  acceptedFileTypes: string[];
  maxFileSizeMB: number;
  maxFiles: number;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  dragActive,
  acceptedFileTypes,
  maxFileSizeMB,
  maxFiles,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileInputChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center",
        dragActive ? "border-brand-orange bg-orange-50" : "border-slate-300 hover:border-slate-400",
        "group"
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={onFileInputChange}
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
  );
};
