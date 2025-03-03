
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightCircle, Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Project Workflow</h3>
          
          {/* Progress Steps */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="absolute h-1 bg-muted inset-x-0 top-1/2 transform -translate-y-1/2 z-0"></div>
            
            <div className={`relative flex flex-col items-center z-10 ${viewMode === ViewMode.STRATEGIC_ANALYSIS ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${viewMode === ViewMode.STRATEGIC_ANALYSIS ? 'bg-primary text-white' : (acceptedCount > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground')}`}>
                {acceptedCount > 0 ? <Check size={16} /> : "1"}
              </div>
              <span className="text-xs mt-1">Strategic Insights</span>
            </div>
            
            <div className={`relative flex flex-col items-center z-10 ${viewMode === ViewMode.NARRATIVE_FRAMEWORK ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${viewMode === ViewMode.NARRATIVE_FRAMEWORK ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="text-xs mt-1">Narrative Framework</span>
            </div>
            
            <div className="relative flex flex-col items-center z-10 text-muted-foreground">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                3
              </div>
              <span className="text-xs mt-1">Presentation</span>
            </div>
          </div>
          
          {/* Current View Description */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              {getViewModeDescription(viewMode)}
            </p>
            
            {viewMode === ViewMode.STRATEGIC_ANALYSIS && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-medium">{acceptedCount}/{insightCount} insights accepted</span>
                </div>
                <Progress value={progressPercentage} className="h-2 w-full" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            {viewMode === ViewMode.STRATEGIC_ANALYSIS && !isNarrativeDisabled ? (
              <Button 
                size="sm" 
                onClick={handleNavigateToNarrative}
                className="ml-auto flex items-center gap-2"
              >
                Next: Build Narrative <ArrowRightCircle size={16} />
              </Button>
            ) : viewMode === ViewMode.NARRATIVE_FRAMEWORK ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewModeChange(ViewMode.STRATEGIC_ANALYSIS)}
                className="flex items-center gap-2"
              >
                Back to Strategic Insights
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewModeSwitcher;
