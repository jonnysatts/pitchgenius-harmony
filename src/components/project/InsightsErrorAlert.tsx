
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
            Retry Analysis
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default InsightsErrorAlert;
