
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";

interface WebInsightsHeaderProps {
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
}

const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Website Insights</h2>
        <p className="text-slate-500 text-sm">
          Strategic insights generated from analyzing the client's website
        </p>
      </div>
      
      {hasWebsiteUrl && onAnalyzeWebsite && (
        <Button
          onClick={onAnalyzeWebsite}
          disabled={isAnalyzing}
          className="mt-4 md:mt-0 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing Website...
            </>
          ) : (
            <>
              <Globe size={16} />
              {hasInsights ? 'Refresh Website Analysis' : 'Analyze Website'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default WebInsightsHeader;
