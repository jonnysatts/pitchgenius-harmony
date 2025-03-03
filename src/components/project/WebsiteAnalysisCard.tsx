
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";

interface WebsiteAnalysisCardProps {
  websiteUrl?: string;
  isAnalyzing?: boolean;
  onAnalyzeWebsite?: () => void;
}

const WebsiteAnalysisCard: React.FC<WebsiteAnalysisCardProps> = ({
  websiteUrl,
  isAnalyzing = false,
  onAnalyzeWebsite
}) => {
  // Can analyze website if:
  // 1. Website URL exists
  // 2. Not currently analyzing website
  // 3. onAnalyzeWebsite function is provided
  const canAnalyzeWebsite = !!websiteUrl && !isAnalyzing && !!onAnalyzeWebsite;
  
  if (!websiteUrl) return null;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Website Analysis</CardTitle>
            <CardDescription>Generate preliminary insights based on the client's website</CardDescription>
          </div>
          
          <Button 
            onClick={onAnalyzeWebsite}
            disabled={!canAnalyzeWebsite}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe size={16} />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-slate-600 flex items-center">
          <Globe size={14} className="mr-2 text-slate-400" />
          <span className="font-medium text-slate-700 mr-1">Website URL:</span> 
          <a 
            href={websiteUrl.startsWith('http') 
              ? websiteUrl 
              : `https://${websiteUrl}`
            } 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate"
          >
            {websiteUrl}
          </a>
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          Click the button above to analyze the client's website for brand positioning, target audience, and potential gaming opportunities.
          Website-derived insights will appear in the Web Insights tab.
        </p>
      </CardContent>
    </Card>
  );
};

export default WebsiteAnalysisCard;
