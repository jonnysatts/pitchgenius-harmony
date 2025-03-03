
import React from "react";
import { Info } from "lucide-react";
import { WebsiteAnalysisControls } from "./WebsiteAnalysisControls";
import { Project } from "@/lib/types";

interface WebInsightsHeaderProps {
  websiteUrl?: string;
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
}

const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({
  websiteUrl,
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights
}) => {
  // Create a mock project with the websiteUrl for WebsiteAnalysisControls
  // Include all required properties from the Project type
  const project: Project = {
    clientWebsite: websiteUrl || '',
    id: '',
    clientName: '',
    clientIndustry: 'other',
    title: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '',
    collaborators: [],
    status: 'draft'
  };
  
  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Website Insights</h2>
          <p className="text-slate-600">
            Analyze the client's website to discover strategic insights about their online presence, positioning, and 
            audience engagement. This data can help inform your gaming strategy recommendations.
          </p>
        </div>
      </div>
      
      <WebsiteAnalysisControls
        project={project}
        isAnalyzing={isAnalyzing}
        onAnalyzeWebsite={onAnalyzeWebsite}
        hasInsights={hasInsights}
      />
    </div>
  );
};

export default WebInsightsHeader;
