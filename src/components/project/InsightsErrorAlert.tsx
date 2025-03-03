
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface InsightsErrorAlertProps {
  error?: string | null;
  usingFallbackInsights?: boolean;
  onRetryAnalysis?: () => void;
}

const InsightsErrorAlert: React.FC<InsightsErrorAlertProps> = ({ 
  error, 
  usingFallbackInsights, 
  onRetryAnalysis 
}) => {
  if (!error && !usingFallbackInsights) return null;
  
  const handleRetryAnalysis = () => {
    if (onRetryAnalysis) {
      onRetryAnalysis();
    }
  };

  return (
    <Alert variant="default" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <div>
          {error || "Using sample insights due to API timeout. Please try again later for Claude AI analysis."}
        </div>
        {(error?.includes("timeout") || error?.includes("Claude AI")) && onRetryAnalysis && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleRetryAnalysis}
          >
            <RefreshCw size={14} />
            Retry Analysis
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default InsightsErrorAlert;
