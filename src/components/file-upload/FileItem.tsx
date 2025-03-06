import React from "react";
import { File, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FileItemProps {
  file: File;
  progress: number;
  onRemove: (fileName: string) => void;
  error?: string;
  status?: 'uploading' | 'complete' | 'error' | 'processing';
}

export const FileItem: React.FC<FileItemProps> = ({ 
  file, 
  progress, 
  onRemove, 
  error, 
  status = progress === 100 ? 'complete' : 'uploading'
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 size={14} className="mr-1 text-green-600" />;
      case 'error':
        return <AlertCircle size={14} className="mr-1 text-red-600" />;
      case 'processing':
        return <Loader2 size={14} className="mr-1 text-amber-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'complete':
        return "Complete";
      case 'error':
        return "Failed";
      case 'processing':
        return "Processing";
      default:
        return `${progress || 0}%`;
    }
  };

  const getFileTypeLabel = () => {
    const extension = file.name.split('.').pop()?.toUpperCase() || '';
    return extension.length > 0 ? extension : 'FILE';
  };

  return (
    <div className={cn(
      "flex items-center p-3 border rounded-lg bg-white",
      status === 'error' && "border-red-200 bg-red-50"
    )}>
      <div className="flex items-center justify-center h-10 w-10 bg-slate-100 rounded mr-3">
        <span className="text-xs font-medium text-slate-500">{getFileTypeLabel()}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
            {file.name}
          </p>
          <p className="text-xs text-slate-500 ml-2 whitespace-nowrap">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        
        <div className="mt-1">
          <Progress 
            value={progress || 0} 
            className={cn(
              "h-1", 
              status === 'error' && "bg-red-100",
              status === 'complete' && "bg-green-100"
            )} 
            indicatorColor={
              status === 'error' ? "bg-red-500" :
              status === 'complete' ? "bg-green-500" :
              undefined
            }
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          {error ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Upload failed
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{error}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs text-slate-500 flex items-center">
              {getStatusIcon()}
              {getStatusText()}
            </span>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-slate-100"
            onClick={() => onRemove(file.name)}
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} className="text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
