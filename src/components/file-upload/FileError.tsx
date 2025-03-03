
import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileErrorProps {
  fileName: string;
  errorMessage: string;
  onDismiss: (fileName: string) => void;
}

export const FileError: React.FC<FileErrorProps> = ({ 
  fileName, 
  errorMessage, 
  onDismiss 
}) => {
  return (
    <div className="flex items-center p-3 border border-red-200 rounded-lg bg-red-50">
      <AlertCircle size={20} className="text-red-500 mr-3" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700 truncate max-w-xs">
          {fileName}
        </p>
        <p className="text-xs text-red-600">
          {errorMessage}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-6 w-6 p-0 rounded-full hover:bg-red-100"
        onClick={() => onDismiss(fileName)}
      >
        <X size={14} className="text-red-500" />
      </Button>
    </div>
  );
};
