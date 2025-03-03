
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";

interface NoInsightsEmptyStateProps {
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
}

const NoInsightsEmptyState: React.FC<NoInsightsEmptyStateProps> = ({ 
  hasWebsiteUrl, 
  isAnalyzing, 
  onAnalyzeWebsite 
}) => {
  return (
    <div className="bg-slate-50 rounded-lg p-8 text-center border border-dashed">
      <Globe size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="text-xl font-medium text-slate-800 mb-2">No Website Insights Yet</h3>
      <p className="text-slate-600 mb-6">
        {hasWebsiteUrl 
          ? "Click 'Analyze Website' to generate insights from the client's website."
          : "Add a client website URL in the Documents tab or Dashboard to analyze their online presence."}
      </p>
      {hasWebsiteUrl && onAnalyzeWebsite && (
        <Button
          onClick={onAnalyzeWebsite}
          disabled={isAnalyzing}
          className="mx-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Analyzing Website...
            </>
          ) : (
            <>
              <Globe size={16} className="mr-2" />
              Analyze Website
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default NoInsightsEmptyState;
