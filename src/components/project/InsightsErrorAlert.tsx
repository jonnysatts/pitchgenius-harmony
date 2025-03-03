import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LoaderCircle } from "lucide-react";

interface InsightsErrorAlertProps {
  error?: string | null;
  usingFallbackInsights?: boolean;
  onRetryAnalysis?: () => void;
  isClaudeProcessing?: boolean;
}

const InsightsErrorAlert: React.FC<InsightsErrorAlertProps> = ({ 
  error, 
  usingFallbackInsights, 
  onRetryAnalysis,
  isClaudeProcessing = false
}) => {
  if (!error && !usingFallbackInsights && !isClaudeProcessing) return null;
  
  if (isClaudeProcessing) {
    return (
      <Alert variant="default" className="mb-4 border-blue-300 bg-blue-50">
        <LoaderCircle className="h-4 w-4 text-blue-500 animate-spin" />
        <AlertDescription className="flex justify-between items-center text-blue-800">
          <div>
            Claude AI is currently analyzing your documents. This may take up to 2 minutes. Please wait...
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="default" className="mb-4 border-amber-300 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="flex justify-between items-center text-amber-800">
        <div>
          {error || "Using sample insights due to API timeout. Please try again later for Claude AI analysis."}
        </div>
        {onRetryAnalysis && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 border-amber-500 text-amber-700 hover:bg-amber-100"
            onClick={onRetryAnalysis}
          >
            <RefreshCw size={14} />
            Retry with Claude AI
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default InsightsErrorAlert;
