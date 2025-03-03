
import React from "react";
import { File, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileItemProps {
  file: File;
  progress: number;
  onRemove: (fileName: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, progress, onRemove }) => {
  return (
    <div className="flex items-center p-3 border rounded-lg bg-white">
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
          <Progress value={progress || 0} className="h-1" />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">
            {progress === 100 ? (
              <span className="flex items-center text-green-600">
                <CheckCircle2 size={12} className="mr-1" /> Complete
              </span>
            ) : (
              `${progress || 0}%`
            )}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-slate-100"
            onClick={() => onRemove(file.name)}
          >
            <X size={14} className="text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
