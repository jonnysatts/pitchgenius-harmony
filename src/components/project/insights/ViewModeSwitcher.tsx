
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export enum ViewMode {
  STRATEGIC_ANALYSIS = "strategic_analysis",
  NARRATIVE_FRAMEWORK = "narrative_framework"
}

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (value: string) => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  onViewModeChange
}) => {
  // Get description based on the current view mode
  const getViewModeDescription = (mode: ViewMode): string => {
    switch (mode) {
      case ViewMode.STRATEGIC_ANALYSIS:
        return "Review insights organized by strategic analysis categories";
      case ViewMode.NARRATIVE_FRAMEWORK:
        return "Build your strategic narrative using insights mapped to presentation sections";
      default:
        return "";
    }
  };

  return (
    <Tabs value={viewMode} onValueChange={onViewModeChange} className="mb-6">
      <TabsList className="grid grid-cols-2 w-full max-w-xl mb-2">
        <TabsTrigger value={ViewMode.STRATEGIC_ANALYSIS}>
          Strategic Analysis
        </TabsTrigger>
        <TabsTrigger value={ViewMode.NARRATIVE_FRAMEWORK}>
          Narrative Framework
        </TabsTrigger>
      </TabsList>
      
      <p className="text-sm text-muted-foreground px-2">
        {getViewModeDescription(viewMode)}
      </p>
    </Tabs>
  );
};

export default ViewModeSwitcher;
