
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw } from 'lucide-react';

interface AnalysisButtonProps {
  isAnalyzing: boolean;
  hasWebsiteUrl: boolean;
  hasInsights: boolean;
  onAnalyzeWebsite: () => void;
}

// This component is no longer used as we've consolidated to a single button in the header
export const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  isAnalyzing,
  hasWebsiteUrl,
  hasInsights,
  onAnalyzeWebsite
}) => {
  return null; // Component no longer in use
};
