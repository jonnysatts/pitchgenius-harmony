
import React from "react";
import { Lightbulb, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightsEmptyStateProps {
  onNavigateToDocuments?: () => void;
  onRetryAnalysis?: () => void;
}

const InsightsEmptyState: React.FC<InsightsEmptyStateProps> = ({ 
  onNavigateToDocuments,
  onRetryAnalysis 
}) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
      <h3 className="mt-2 text-lg font-semibold text-slate-900">No insights yet</h3>
      <p className="mt-1 text-slate-500 max-w-md mx-auto">
        Upload documents and run the AI analysis to generate strategic insights for gaming opportunities
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        {onNavigateToDocuments && (
          <Button 
            onClick={onNavigateToDocuments}
          >
            Go to Documents
          </Button>
        )}
        {onRetryAnalysis && (
          <Button 
            variant="outline"
            onClick={onRetryAnalysis}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Retry Analysis
          </Button>
        )}
      </div>
    </div>
  );
};

export default InsightsEmptyState;
