
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Globe, RefreshCcw } from "lucide-react";

interface NoInsightsPlaceholderProps {
  error: string | null;
  onNavigateToWebInsights?: () => void;
  onRetryAnalysis?: () => void;
}

const NoInsightsPlaceholder: React.FC<NoInsightsPlaceholderProps> = ({
  error,
  onNavigateToWebInsights,
  onRetryAnalysis
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg text-center">
      <FileText className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">No Document Insights Available</h3>
      
      {error ? (
        <p className="text-slate-500 max-w-md mb-6">
          There was an error generating insights from your documents. Please try again.
        </p>
      ) : (
        <p className="text-slate-500 max-w-md mb-6">
          Upload documents and run the document analysis to generate strategic insights.
        </p>
      )}
      
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetryAnalysis && (
          <Button variant="outline" onClick={onRetryAnalysis} className="flex items-center gap-2">
            <RefreshCcw size={16} />
            Retry Analysis
          </Button>
        )}
        
        {onNavigateToWebInsights && (
          <Button variant="default" onClick={onNavigateToWebInsights} className="flex items-center gap-2">
            <Globe size={16} />
            Try Website Analysis
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoInsightsPlaceholder;
