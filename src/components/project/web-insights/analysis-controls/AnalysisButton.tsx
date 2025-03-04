
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw, ArrowRight } from 'lucide-react';

interface AnalysisButtonProps {
  isAnalyzing: boolean;
  hasWebsiteUrl: boolean;
  hasInsights: boolean;
  onAnalyzeWebsite: () => void;
}

export const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  isAnalyzing,
  hasWebsiteUrl,
  hasInsights,
  onAnalyzeWebsite
}) => {
  return (
    <Button
      onClick={onAnalyzeWebsite}
      disabled={isAnalyzing || !hasWebsiteUrl}
      className="w-full md:w-auto"
      size="lg"
    >
      {isAnalyzing ? (
        <>
          <Globe className="mr-2 h-4 w-4 animate-spin" />
          Analyzing Website...
        </>
      ) : hasInsights ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Website Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      ) : (
        <>
          <Globe className="mr-2 h-4 w-4" />
          Start Website Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
