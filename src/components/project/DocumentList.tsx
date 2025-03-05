
import React from "react";
import { Document } from "@/lib/types";
import { getFileCategory, sortDocumentsByPriority } from "@/services/documentService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, FileText, Download, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface DocumentListProps {
  documents: Document[];
  onRemoveDocument: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onRemoveDocument 
}) => {
  const sortedDocuments = sortDocumentsByPriority(documents);
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No documents</h3>
        <p className="mt-1 text-sm text-slate-500">
          Start by uploading documents to this project
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedDocuments.map((document) => {
        // Handle document date formatting
        let uploadTimeDisplay = "Unknown date";
        if (document.uploadedAt) {
          try {
            const uploadDate = typeof document.uploadedAt === 'string' 
              ? parseISO(document.uploadedAt) 
              : new Date(document.uploadedAt);
            uploadTimeDisplay = formatDistanceToNow(uploadDate, { addSuffix: true });
          } catch (e) {
            console.error("Error formatting date:", e);
          }
        }
        
        // Determine file type for display
        const fileType = document.type ? getFileCategory(document.type) : 
                         document.name.endsWith('.pdf') ? 'PDF' :
                         document.name.endsWith('.docx') ? 'Word' :
                         document.name.endsWith('.xlsx') ? 'Excel' : 'Document';
                         
        return (
          <div 
            key={document.id} 
            className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-slate-100 rounded">
                <File className="h-6 w-6 text-slate-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {document.name}
                </h4>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="outline">
                    {fileType}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="text-xs text-slate-500">
                    {uploadTimeDisplay}
                  </span>
                  {document.priority && document.priority > 0 && (
                    <div className="flex items-center text-amber-500">
                      <Star size={12} className="mr-1" />
                      <span className="text-xs">Priority {document.priority}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {document.url && !document.url.startsWith('blob:') && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={document.url} download={document.name} target="_blank" rel="noopener noreferrer">
                    <Download size={18} />
                  </a>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveDocument(document.id)}
              >
                <Trash2 size={18} className="text-slate-400 hover:text-red-500" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentList;
