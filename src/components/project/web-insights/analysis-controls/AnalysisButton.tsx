
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
      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6"
      size="lg"
    >
      {isAnalyzing ? (
        <>
          <Globe className="mr-2 h-5 w-5 animate-spin" />
          Analyzing Website...
        </>
      ) : hasInsights ? (
        <>
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh Website Analysis
        </>
      ) : (
        <>
          <Globe className="mr-2 h-5 w-5" />
          Start Website Analysis
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  );
};
