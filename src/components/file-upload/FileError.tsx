
import React from "react";
import { AlertCircle, X, ExternalLink } from "lucide-react";
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
  // Extract more helpful information for common errors
  const getHelpfulMessage = (error: string, filename: string) => {
    if (error.includes("row-level security policy")) {
      return "The app is running in development mode - your files will still work locally.";
    }
    
    if (error.includes("too large") || filename.toLowerCase().endsWith('.pdf') && error.includes("unexpected error")) {
      return "Try compressing this PDF file or splitting it into smaller documents.";
    }
    
    return null;
  };
  
  const helpfulHint = getHelpfulMessage(errorMessage, fileName);
  
  return (
    <div className="flex flex-col p-3 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-center">
        <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 truncate max-w-xs">
            {fileName}
          </p>
          <p className="text-xs text-red-600">
            {errorMessage}
          </p>
          {helpfulHint && (
            <p className="text-xs mt-1 text-red-800 font-medium">
              {helpfulHint}
            </p>
          )}
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
    </div>
  );
};
