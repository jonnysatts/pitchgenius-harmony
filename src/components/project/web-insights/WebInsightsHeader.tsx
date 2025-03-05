
import React from 'react';
import { AIProcessingStatus } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface WebInsightsHeaderProps {
  websiteUrl?: string;
  hasWebsiteUrl: boolean;
  isAnalyzing: boolean;
  onAnalyzeWebsite?: () => void;
  hasInsights: boolean;
  aiStatus?: AIProcessingStatus;
}

export const WebInsightsHeader: React.FC<WebInsightsHeaderProps> = ({
  websiteUrl,
  hasWebsiteUrl,
  isAnalyzing,
  onAnalyzeWebsite,
  hasInsights,
  aiStatus
}) => {
  const handleAnalyzeWebsite = () => {
    if (onAnalyzeWebsite) {
      toast.info("Starting website analysis", {
        description: "Analyzing website content to generate insights"
      });
      onAnalyzeWebsite();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Website Insights</h2>
      </div>
      
      <p className="text-slate-600 mb-6 max-w-3xl">
        Analyze your client's website to generate additional strategic insights for potential gaming partnerships.
        Our AI will examine the website content and structure to identify key opportunities.
      </p>
      
      {hasWebsiteUrl && !isAnalyzing && onAnalyzeWebsite && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-blue-800 mb-1">Analyze Client Website</h3>
              <p className="text-blue-700 text-sm">{websiteUrl}</p>
            </div>
            <Button
              onClick={handleAnalyzeWebsite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-36"
              size="lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
