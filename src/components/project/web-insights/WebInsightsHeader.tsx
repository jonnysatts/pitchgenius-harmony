
import React from "react";
import { Info } from "lucide-react";

interface WebInsightsHeaderProps {
  websiteUrl?: string | null;
  hasWebsiteUrl?: boolean;
  isAnalyzing?: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights?: boolean;
}

const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({ 
  websiteUrl,
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Website Insights</h2>
      <p className="text-slate-600 flex items-start gap-2">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <span>
          Analyze the client's website to discover strategic insights about their 
          online presence, positioning, and audience engagement. This data can 
          help inform your gaming strategy recommendations.
        </span>
      </p>
    </div>
  );
};

export default WebInsightsHeader;
