
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export enum ViewMode {
  STRATEGIC_ANALYSIS = "strategic_analysis",
  NARRATIVE_FRAMEWORK = "narrative_framework"
}

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (value: string) => void;
  insightsReviewed: boolean;
  insightCount: number;
  acceptedCount: number;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  onViewModeChange,
  insightsReviewed,
  insightCount,
  acceptedCount
}) => {
  // Get description based on the current view mode
  const getViewModeDescription = (mode: ViewMode): string => {
    switch (mode) {
      case ViewMode.STRATEGIC_ANALYSIS:
        return "Review and accept strategic insights before building your narrative";
      case ViewMode.NARRATIVE_FRAMEWORK:
        return "Organize accepted insights into a compelling presentation structure";
      default:
        return "";
    }
  };

  // Narrative mode should be disabled until at least some insights are accepted
  const isNarrativeDisabled = acceptedCount === 0;
  
  // Show progress indicator based on accepted insights
  const progressPercentage = insightCount > 0 ? Math.round((acceptedCount / insightCount) * 100) : 0;
  
  // Handle manual navigation to narrative framework
  const handleNavigateToNarrative = () => {
    if (!isNarrativeDisabled) {
      onViewModeChange(ViewMode.NARRATIVE_FRAMEWORK);
    }
  };

  return (
    <Card className="mb-6 border-2 border-muted">
      <CardContent className="p-4">
        <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value={ViewMode.STRATEGIC_ANALYSIS}>
                1. Strategic Analysis
              </TabsTrigger>
              <TabsTrigger 
                value={ViewMode.NARRATIVE_FRAMEWORK} 
                disabled={isNarrativeDisabled}
              >
                2. Narrative Framework
              </TabsTrigger>
            </TabsList>
            
            {viewMode === ViewMode.STRATEGIC_ANALYSIS && !isNarrativeDisabled && (
              <Button 
                size="sm" 
                onClick={handleNavigateToNarrative}
                className="ml-auto flex items-center gap-2"
              >
                Next: Build Narrative <ArrowRightCircle size={16} />
              </Button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              {getViewModeDescription(viewMode)}
            </p>
            
            {viewMode === ViewMode.STRATEGIC_ANALYSIS && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{acceptedCount}/{insightCount} insights accepted</span>
                <span className="text-sm font-medium text-muted-foreground">({progressPercentage}%)</span>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ViewModeSwitcher;
